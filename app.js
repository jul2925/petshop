(function(){
  // ===== DATA STORE =====
  var DB={
    products:[],
    employees:[],
    users:[],
    clients:[],
    bathGrooming:[],
    services:[],
    clientPackages:[],
    waitingList:[],
    sales:[],
    expenses:[],
    suppliers:[],
    supplierOrders:[],
    activityLog:[],
    nextProductId:1,
    nextEmployeeId:1,
    nextUserId:1,
    nextSaleId:1,
    nextClientId:1,
    nextBathId:1,
    nextServiceId:1,
    nextPackageId:1,
    nextExpenseId:1,
    nextSupplierId:1,
    nextSupplierOrderId:1,
    settings:{
      pixKey:'',
      pixName:'PetShop Prado',
      pixCity:'Sao Paulo',
      userPermissions:{}
    }
  };

  var DB_VERSION=10;
  var saved=localStorage.getItem('petshoppradoDB');
  var savedVer=parseInt(localStorage.getItem('petshoppradoDBVer'))||0;
  if(saved&&savedVer>=DB_VERSION){try{DB=JSON.parse(saved)}catch(e){}}

  // Carrega do servidor
  var isSaving=false;
  var lastServerVersion=0;

  function loadFromServer(callback){
    fetch('/api/load').then(function(r){return r.json()}).then(function(d){
      if(d&&d.products){
        DB=d;
        migratePackages();
        localStorage.setItem('petshoppradoDB',JSON.stringify(DB));
        localStorage.setItem('petshoppradoDBVer',DB_VERSION);
        if(callback)callback(true);
      }else{
        if(callback)callback(false);
      }
    }).catch(function(){if(callback)callback(false)});
  }

  // Carrega inicial do servidor
  (function(){
    loadFromServer(function(ok){
      if(!ok)console.warn('[DB] Servidor indisponivel, usando dados locais');
    });
  })();

  if(!DB.clientPackages)DB.clientPackages=[];
  if(!DB.waitingList)DB.waitingList=[];
  if(!DB.expenses)DB.expenses=[];
  if(!DB.suppliers)DB.suppliers=[];
  if(!DB.supplierOrders)DB.supplierOrders=[];
  if(!DB.activityLog)DB.activityLog=[];
  if(!DB.sales)DB.sales=[];
  // Migracao de pacotes: de creditos/sessoes para saldo em dinheiro
  function migratePackages(){
    (DB.clientPackages||[]).forEach(function(p){
      if(p.balance===undefined){
        if(p.totalCredits&&p.totalCredits>0){
          var perSession=p.price/p.totalCredits;
          p.usedAmount=Math.round(((p.usedCredits||0)*perSession)*100)/100;
          p.balance=Math.round((p.price-p.usedAmount)*100)/100;
        }else{
          p.usedAmount=0;
          p.balance=p.price||0;
        }
        delete p.totalCredits;
        delete p.usedCredits;
      }
      if(p.usedAmount===undefined)p.usedAmount=0;
      if(p.balance===undefined)p.balance=p.price||0;
    });
  }
  migratePackages();
  // Garante que os usuarios padrao existam (protecao contra dados corrompidos)
  if(!DB.users||!DB.users.length||!DB.users.find(function(x){return x.username==='admin'})){
    DB.users=[
      {id:1,username:'admin',password:'admin123',name:'Administrador Geral',type:'admin',active:true},
      {id:2,username:'func',password:'func123',name:'Funcionario Teste',type:'func',active:true},
      {id:3,username:'cliente',password:'cli123',name:'Cliente Teste',type:'cliente',active:true}
    ];
    DB.nextUserId=4;
  }

  // SSE - Sincronizacao em tempo real
  var sseConnection=null;
  var sseRetryCount=0;
  var pollingInterval=null;

  function connectSSE(){
    if(sseConnection){sseConnection.close()}
    try{
      sseConnection=new EventSource('/api/events');
      sseRetryCount=0;
      sseConnection.addEventListener('connected',function(e){
        console.log('[SSE] Conectado ao servidor');
        stopPolling();
      });
      sseConnection.addEventListener('update',function(e){
        if(isSaving)return;
        try{
          var data=JSON.parse(e.data);
          console.log('[SSE] Atualizacao recebida (v'+data.version+')');
          fetch('/api/sync?v='+lastPollVersion).then(function(r){return r.json()}).then(function(s){
            if(s.updated&&s.data){
              DB=s.data;
              migratePackages();
              localStorage.setItem('petshoppradoDB',JSON.stringify(DB));
              localStorage.setItem('petshoppradoDBVer',DB_VERSION);
              lastPollVersion=s.version||0;
              renderPage();
              toast('Dados atualizados!','info');
            }
          }).catch(function(){
            loadFromServer(function(ok){
              if(ok){renderPage();toast('Dados atualizados!','info');}
            });
          });
        }catch(ex){}
      });
      sseConnection.onerror=function(){
        console.warn('[SSE] Erro, reconectando...');
        sseConnection.close();
        sseRetryCount++;
        if(sseRetryCount<5){
          setTimeout(connectSSE,3000);
        }else{
          console.warn('[SSE] Maximo de tentativas, iniciando polling');
          startPolling();
        }
      };
    }catch(e){
      console.warn('[SSE] Nao foi possivel conectar:',e);
      startPolling();
    }
  }

  // Polling como fallback (para Render free tier)
  var lastPollVersion=0;
  function startPolling(){
    if(pollingInterval)return;
    console.log('[POLL] Iniciando polling a cada 10s');
    pollingInterval=setInterval(function(){
      if(isSaving)return;
      fetch('/api/sync?v='+lastPollVersion).then(function(r){return r.json()}).then(function(s){
        if(s.updated&&s.data){
          DB=s.data;
          migratePackages();
          localStorage.setItem('petshoppradoDB',JSON.stringify(DB));
          localStorage.setItem('petshoppradoDBVer',DB_VERSION);
          lastPollVersion=s.version||0;
          renderPage();
          toast('Dados atualizados!','info');
        }else{
          lastPollVersion=s.version||lastPollVersion;
        }
      }).catch(function(){});
    },10000);
  }

  function stopPolling(){
    if(pollingInterval){clearInterval(pollingInterval);pollingInterval=null;}
  }

  connectSSE();
  startPolling();

  // Auto-conectar impressora se estava conectada
  async function autoConnectPrinter(){
    if(!navigator.serial)return;
    try{
      var cfg=getPrinterCfg();
      printerState.baudRate=cfg.baudRate||9600;
      var ports=await navigator.serial.getPorts();
      if(ports.length>0){
        var port=ports[0];
        await port.open({baudRate:printerState.baudRate});
        printerState.port=port;
        printerState.connected=true;
        printerState.writer=port.writable.getWriter();
        console.log('[PRINTER] Auto-conectada — baud: '+printerState.baudRate);
        updatePrinterStatusUI();
      }
    }catch(e){
      console.log('[PRINTER] Auto-conexao falhou:',e.message);
    }
  }
  setTimeout(autoConnectPrinter,2000);

  function saveDB(){
    var payload=JSON.stringify(DB);
    localStorage.setItem('petshoppradoDB',payload);
    localStorage.setItem('petshoppradoDBVer',DB_VERSION);
    isSaving=true;
    fetch('/api/save',{method:'POST',headers:{'Content-Type':'application/json','x-auth-token':getAuthToken()},body:payload})
      .then(function(r){return r.json()}).then(function(d){
        isSaving=false;
        if(d&&d.version){
          lastPollVersion=d.version;
          lastServerVersion=d.version;
        }else if(d&&d.error==='Nao autorizado'){
          toast('Sessao expirada. Entre novamente.','error');
          setTimeout(function(){window.location.reload()},1200);
        }
      }).catch(function(){isSaving=false});
  }

  // ===== STATE =====
  var currentUser=null;
  var currentPage='dashboard';
  var cartItems=[];
  var calcHistory=[];
  var calcExpr='';
  var calcResult='0';

  // ===== HELPERS =====
  var $=function(id){return document.getElementById(id)};
  function toast(msg,type){
    type=type||'info';
    var t=document.createElement('div');
    t.className='toast t-'+(type==='success'?'ok':type==='error'?'err':'info');
    var ic={success:'✓',error:'✕',info:'ℹ'};
    t.innerHTML='<span>'+ic[type]+'</span> '+msg;
    $('toastBox').appendChild(t);
    setTimeout(function(){if(t.parentNode)t.remove()},3000);
  }
  (function(){
    try{
      if(window.innerWidth>768&&screen.width>0&&screen.width<=768){
        setTimeout(function(){
          toast('⚠ Parece que esta em modo desktop. No menu ⋮ desative "Versao para computador" para o layout correto.','error');
        },1200);
      }
    }catch(e){}
  })();
  function formatDate(d){var dt=new Date(d);return dt.toLocaleDateString('pt-BR')+' '+dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
  function toLocalInputValue(d){
    var dt=new Date(d);
    if(isNaN(dt.getTime()))return'';
    var pad=function(n){return(n<10?'0':'')+n};
    return dt.getFullYear()+'-'+pad(dt.getMonth()+1)+'-'+pad(dt.getDate())+'T'+pad(dt.getHours())+':'+pad(dt.getMinutes());
  }
  function formatMoney(v){return 'R$ '+v.toFixed(2).replace('.',',')}
  function genId(type){
    if(type==='product')return DB.nextProductId++;
    if(type==='employee')return DB.nextEmployeeId++;
    if(type==='user')return DB.nextUserId++;
    if(type==='sale')return DB.nextSaleId++;
    if(type==='bath')return DB.nextBathId++;
    if(type==='client')return DB.nextClientId++;
    if(type==='service')return DB.nextServiceId++;
    if(type==='package')return DB.nextPackageId++;
    if(type==='expense')return DB.nextExpenseId++;
    if(type==='supplier')return DB.nextSupplierId++;
    if(type==='supplierorder')return DB.nextSupplierOrderId++;
  }
  function pkField(type,id){
    var displayId=id?id:DB['next'+type.charAt(0).toUpperCase()+type.slice(1)+'Id']||'?';
    var label=id?'ID (Chave Primaria)':'Proximo ID';
    return '<div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);margin-bottom:12px">'+
      '<i data-lucide="key" style="width:16px;height:16px;color:var(--accent);flex-shrink:0"></i>'+
      '<div><div style="font-size:11px;color:var(--txt2)">'+label+'</div>'+
      '<div style="font-size:16px;font-weight:700;color:var(--accent);font-family:monospace">#'+displayId+'</div></div></div>';
  }
  function hasFuncPermission(funcId){
    if(!currentUser)return false;
    if(currentUser.type==='admin')return true;
    var perm=DB.settings&&DB.settings.userPermissions?DB.settings.userPermissions:{};
    var userPerm=perm[currentUser.type]||{};
    return userPerm[funcId]!==false;
  }
  function logActivity(action,detail){
    DB.activityLog.unshift({
      date:new Date().toISOString(),
      user:currentUser?currentUser.name:'Sistema',
      action:action,
      detail:detail||''
    });
    if(DB.activityLog.length>500)DB.activityLog.length=500;
    saveDB();
  }

  // ===== MODAL =====
  function openModal(title,bodyHTML,footHTML,extraClass){
    $('modalTitle').textContent=title;
    $('modalBody').innerHTML=bodyHTML;
    $('modalFoot').innerHTML=footHTML;
    var modal=$('modalBox');
    modal.className='modal';
    if(extraClass)modal.className+=' '+extraClass;
    $('modalBg').classList.add('open');
    if(typeof lucide!=='undefined')lucide.createIcons();
  }
  function closeModal(){$('modalBg').classList.remove('open');$('modalBox').className='modal'}
  $('modalX').addEventListener('click',closeModal);
  $('modalBg').addEventListener('click',function(e){if(e.target===$('modalBg'))closeModal()});

  // ===== LOGIN =====
  function getAuthToken(){
    try{
      var s=localStorage.getItem('petshoppradoSession');
      if(s){s=JSON.parse(s);return s.token||''}
    }catch(e){}
    return '';
  }
  function enterApp(user,page){
    currentUser=user;
    $('loginPage').style.display='none';
    $('appPage').style.display='block';
    $('userName').textContent=user.name;
    $('userRole').textContent=user.type==='admin'?'Administrador':user.type==='func'?'Funcionario':'Cliente';
    $('userAvatar').textContent=user.name[0].toUpperCase();
    applyCompanyLogo();
    buildSidebar();
    navigateTo(page||'pdv');
    logActivity('LOGIN','Usuario logado no sistema');
    toast('Bem-vindo, '+user.name+'!','success');
    setTimeout(checkBathReminders,500);
  }

  $('loginBtn').addEventListener('click',function(){
    var u=$('loginUser').value.trim();
    var p=$('loginPass').value.trim();
    if(!u||!p){toast('Preencha usuario e senha!','error');return}

    fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})})
    .then(function(r){return r.json()})
    .then(function(data){
      if(data.ok&&data.user){
        localStorage.setItem('petshoppradoSession',JSON.stringify({userId:data.user.id,type:data.user.type,page:'dashboard',token:data.token||''}));
        // Atualiza DB local com dados do servidor se disponivel
        loadFromServer(function(){});
        enterApp(data.user);
      }else{
        toast('Usuario ou senha invalidos!','error');
      }
    })
    .catch(function(){
      toast('Servidor indisponivel — nao foi possivel entrar','error');
    });
  });
  $('loginPass').addEventListener('keydown',function(e){if(e.key==='Enter')$('loginBtn').click()});
  $('loginUser').addEventListener('keydown',function(e){if(e.key==='Enter')$('loginPass').focus()});

  window.toggleLoginPass=function(){
    var input=$('loginPass');
    var icon=$('loginPassIcon');
    if(input.type==='password'){input.type='text';icon.setAttribute('data-lucide','eye-off')}
    else{input.type='password';icon.setAttribute('data-lucide','eye')}
    if(typeof lucide!=='undefined')lucide.createIcons();
  };

  setTimeout(function(){var u=$('loginUser');if(u)u.focus()},300);

  // ===== AUTO-LOGIN =====
  (function(){
    var session=localStorage.getItem('petshoppradoSession');
    if(!session)return;
    var s;
    try{s=JSON.parse(session)}catch(e){return}
    if(!s||!s.token){
      // Sessao antiga sem token: exige novo login
      localStorage.removeItem('petshoppradoSession');
      return;
    }
    fetch('/api/me',{headers:{'x-auth-token':s.token}})
    .then(function(r){return r.json()})
    .then(function(data){
      if(data.ok&&data.user){
        loadFromServer(function(){});
        enterApp(data.user,s.page);
      }else{
        localStorage.removeItem('petshoppradoSession');
      }
    })
    .catch(function(){
      // Servidor indisponivel: tenta usar o ultimo usuario salvo
      var user=DB.users.find(function(x){return x.id===s.userId&&x.type===s.type&&x.active});
      if(user)enterApp(user,s.page);
    });
  })();

  // ===== LEMBRETES DE BANHO & TOSA =====
  var reminderShown={};
  setInterval(checkBathReminders,30*60*1000);
  function checkBathReminders(){
    if(!currentUser||(currentUser.type!=='admin'&&currentUser.type!=='func'))return;
    var now=new Date();
    var today=now.toDateString();
    var tomorrow=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1).toDateString();
    var tomorrowEnd=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1,23,59,59);
    var items=(DB.bathGrooming||[]).filter(function(b){
      if(!b.date)return false;
      var st=b.status||'Agendado';
      if(st==='Concluido'||st==='Cancelado')return false;
      var bd=new Date(b.date);
      var diff=bd-now;
      if(diff<-60*60*1000)return false;
      if(diff>24*60*60*1000+12*60*60*1000)return false;
      return true;
    }).sort(function(a,b){return new Date(a.date)-new Date(b.date)});

    var todayItems=items.filter(function(b){return new Date(b.date).toDateString()===today});
    var tomorrowItems=items.filter(function(b){return new Date(b.date).toDateString()===tomorrow});

    if(todayItems.length>0){
      var key='today_'+today;
      if(!reminderShown[key]){
        reminderShown[key]=true;
        setTimeout(function(){
          toast('Hoje: '+todayItems.length+(todayItems.length===1?' banho agendado':' banhos agendados')+' — '+todayItems.map(function(b){return b.dogName}).join(', '),'info');
        },1500);
      }
    }
    if(tomorrowItems.length>0){
      var key2='tomorrow_'+tomorrow;
      if(!reminderShown[key2]){
        reminderShown[key2]=true;
        setTimeout(function(){
          toast('Amanha: '+tomorrowItems.length+(tomorrowItems.length===1?' banho agendado':' banhos agendados')+' — '+tomorrowItems.map(function(b){return b.dogName}).join(', '),'info');
        },2500);
      }
    }
    var urgentItems=items.filter(function(b){
      var diff=new Date(b.date)-now;
      return diff>0&&diff<=60*60*1000;
    });
    if(urgentItems.length>0){
      var key3='urgent_'+today+'_'+now.getHours();
      if(!reminderShown[key3]){
        reminderShown[key3]=true;
        setTimeout(function(){
          toast('Em 1h: '+urgentItems.length+(urgentItems.length===1?' banho comecando':' banhos comecando')+' — '+urgentItems.map(function(b){return b.dogName+' ('+new Date(b.date).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+')'}).join(', '),'info');
        },3500);
      }
    }
  }

  // ===== SIDEBAR =====
  function buildSidebar(){
    var nav=$('sidebarNav');
    var items=[];
    var perm=DB.settings&&DB.settings.userPermissions?DB.settings.userPermissions:{};
    var userPerm=perm[currentUser.type]||{};
    function hasAccess(pageId){return userPerm[pageId]!==false}
    if(currentUser.type==='admin'){
      items=[
        {group:'Principal',items:[
          {id:'dashboard',icon:'layout-dashboard',label:'Dashboard'},
          {id:'salemode',icon:'zap',label:'Modo Venda'},
          {id:'pdv',icon:'shopping-cart',label:'PDV / Caixa'},
          {id:'calculator',icon:'calculator',label:'Calculadora'}
        ]},
        {group:'Gestao',items:[
          {id:'products',icon:'package',label:'Produtos'},
          {id:'stock',icon:'clipboard-list',label:'Estoque'},
          {id:'expiryreport',icon:'calendar-clock',label:'Validade'},
          {id:'employees',icon:'users',label:'Funcionarios'},
          {id:'users',icon:'user',label:'Usuarios'},
          {id:'categories',icon:'tag',label:'Categorias'},
          {id:'pricetags',icon:'tags',label:'Etiquetas'}
        ]},
        {group:'Compras',items:[
          {id:'suppliers',icon:'truck',label:'Fornecedores'},
          {id:'supplierorders',icon:'shopping-bag',label:'Pedidos ao Fornecedor'}
        ]},
        {group:'PetShop',items:[
          {id:'clients',icon:'user-round',label:'Clientes'},
          {id:'bathgrooming',icon:'bath',label:'Banho & Tosa'},
          {id:'services',icon:'concierge-bell',label:'Servicos'},
          {id:'packages',icon:'ticket',label:'Pacotes'}
        ]},
        {group:'Financeiro',items:[
          {id:'sales',icon:'banknote',label:'Vendas'},
          {id:'expenses',icon:'receipt',label:'Despesas'},
          {id:'reports',icon:'trending-up',label:'Relatorios'}
        ]},
        {group:'Sistema',items:[
          {id:'company',icon:'building-2',label:'Empresa'},
          {id:'activitylog',icon:'file-text',label:'Log de Atividades'},
          {id:'dbconfig',icon:'database',label:'Banco de Dados'},
          {id:'backup',icon:'refresh-cw',label:'Backup / Restore'},
          {id:'settings',icon:'settings',label:'Configuracoes'},
          {id:'permissions',icon:'shield',label:'Permissoes'}
        ]}
      ];
    }else if(currentUser.type==='func'){
      items=[
        {group:'Principal',items:[
          {id:'dashboard',icon:'layout-dashboard',label:'Dashboard'},
          {id:'salemode',icon:'zap',label:'Modo Venda'},
          {id:'pdv',icon:'shopping-cart',label:'PDV / Caixa'},
          {id:'calculator',icon:'calculator',label:'Calculadora'}
        ]},
        {group:'Gestao',items:[
          {id:'products',icon:'package',label:'Produtos'},
          {id:'stock',icon:'clipboard-list',label:'Estoque'},
          {id:'expiryreport',icon:'calendar-clock',label:'Validade'},
          {id:'employees',icon:'users',label:'Funcionarios'},
          {id:'users',icon:'user',label:'Usuarios'},
          {id:'categories',icon:'tag',label:'Categorias'},
          {id:'pricetags',icon:'tags',label:'Etiquetas'}
        ]},
        {group:'Compras',items:[
          {id:'suppliers',icon:'truck',label:'Fornecedores'},
          {id:'supplierorders',icon:'shopping-bag',label:'Pedidos ao Fornecedor'}
        ]},
        {group:'PetShop',items:[
          {id:'clients',icon:'user-round',label:'Clientes'},
          {id:'bathgrooming',icon:'bath',label:'Banho & Tosa'},
          {id:'services',icon:'concierge-bell',label:'Servicos'},
          {id:'packages',icon:'ticket',label:'Pacotes'}
        ]},
        {group:'Financeiro',items:[
          {id:'sales',icon:'banknote',label:'Vendas'},
          {id:'expenses',icon:'receipt',label:'Despesas'},
          {id:'reports',icon:'trending-up',label:'Relatorios'}
        ]},
        {group:'Sistema',items:[
          {id:'company',icon:'building-2',label:'Empresa'},
          {id:'activitylog',icon:'file-text',label:'Log de Atividades'},
          {id:'dbconfig',icon:'database',label:'Banco de Dados'},
          {id:'backup',icon:'refresh-cw',label:'Backup / Restore'},
          {id:'settings',icon:'settings',label:'Configuracoes'}
        ]}
      ];
    }else{
      items=[
        {group:'Principal',items:[
          {id:'pdv',icon:'shopping-cart',label:'Comprar'},
          {id:'calculator',icon:'calculator',label:'Calculadora'}
        ]},
        {group:'Conta',items:[
          {id:'myorders',icon:'package',label:'Meus Pedidos'}
        ]},
        {group:'PetShop',items:[
          {id:'bathgrooming',icon:'bath',label:'Meus Agendamentos'}
        ]}
      ];
    }
    var filteredItems=items.map(function(g){
      return{group:g.group,items:g.items.filter(function(it){return hasAccess(it.id)})};
    }).filter(function(g){return g.items.length>0});
    var html='';
    filteredItems.forEach(function(g){
      html+='<div class="nav-group"><div class="nav-label">'+g.group+'</div>';
      g.items.forEach(function(it){
        html+='<button data-page="'+it.id+'"'+(it.id===currentPage?' class="active"':'')+'><i data-lucide="'+it.icon+'" class="icon"></i>'+it.label+'</button>';
      });
      html+='</div>';
    });
    nav.innerHTML=html;
    nav.querySelectorAll('button').forEach(function(btn){
      btn.addEventListener('click',function(){
        navigateTo(btn.dataset.page);
        document.getElementById('sidebar').classList.remove('open');
      });
    });
    if(typeof lucide!=='undefined')lucide.createIcons();
  }

  $('logoutBtn').addEventListener('click',function(){
    currentUser=null;cartItems=[];
    localStorage.removeItem('petshoppradoSession');
    $('appPage').style.display='none';
    $('loginPage').style.display='flex';
    $('loginUser').value='';$('loginPass').value='';
    toast('Logout realizado','info');
  });

  $('mobileMenuBtn').addEventListener('click',function(){$('sidebar').classList.toggle('open')});

  // ===== NAVIGATION =====
  function navigateTo(page){
    currentPage=page;
    document.querySelectorAll('.sidebar-nav button').forEach(function(b){b.classList.remove('active')});
    var activeBtn=document.querySelector('.sidebar-nav button[data-page="'+page+'"]');
    if(activeBtn)activeBtn.classList.add('active');
    $('sidebar').classList.remove('open');
    renderPage();
    try{
      var s=localStorage.getItem('petshoppradoSession');
      if(s){s=JSON.parse(s);s.page=page;localStorage.setItem('petshoppradoSession',JSON.stringify(s))}
    }catch(e){}
  }

  function renderPage(){
    var m=$('mainContent');
    switch(currentPage){
      case 'dashboard':renderDashboard(m);break;
      case 'salemode':renderSaleMode(m);break;
      case 'pdv':renderPDV(m);break;
      case 'products':renderProducts(m);break;
      case 'stock':renderStock(m);break;
      case 'employees':renderEmployees(m);break;
      case 'users':renderUsers(m);break;
      case 'categories':renderCategories(m);break;
      case 'sales':renderSales(m);break;
      case 'expenses':renderExpenses(m);break;
      case 'reports':renderReports(m);break;
      case 'calculator':renderCalculator(m);break;
      case 'myorders':renderMyOrders(m);break;
      case 'activitylog':renderActivityLog(m);break;
      case 'pricetags':renderPriceTags(m);break;
      case 'expiryreport':renderExpiryReport(m);break;
      case 'backup':renderBackup(m);break;
      case 'dbconfig':renderDbConfig(m);break;
      case 'company':renderCompany(m);break;
      case 'clients':renderClients(m);break;
      case 'bathgrooming':renderBathGrooming(m);break;
      case 'services':renderServices(m);break;
      case 'packages':renderPackages(m);break;
      case 'suppliers':renderSuppliers(m);break;
      case 'supplierorders':renderSupplierOrders(m);break;
      case 'settings':renderSettings(m);break;
      case 'permissions':renderPermissions(m);break;
      default:m.innerHTML='<div class="empty-msg">Pagina nao encontrada</div>';
    }
    if(typeof lucide!=='undefined')lucide.createIcons();
  }

  // ===== DASHBOARD =====
  function renderDashboard(m){
    var totalProducts=DB.products.length;
    var lowStock=DB.products.filter(function(p){return p.stock<=p.minStock}).length;
    var totalStockValue=DB.products.reduce(function(s,p){return s+(p.price*p.stock)},0);
    var activeSales=DB.sales.filter(function(s){return s.status!=='cancelado'});
    var totalSales=activeSales.length;
    var totalRevenue=activeSales.reduce(function(s,v){return s+v.total},0);
    var totalExpenses=(DB.expenses||[]).reduce(function(s,e){return s+e.amount},0);
    var allOrders=DB.supplierOrders||[];
    var totalOrdersCost=allOrders.filter(function(o){return o.status==='Recebido'||o.status==='Recebido Parcial'}).reduce(function(s,o){return s+o.total},0);
    var totalProfit=totalRevenue-totalExpenses-totalOrdersCost;
    var totalEmp=DB.employees.filter(function(e){return e.active}).length;
    var totalUsers=DB.users.filter(function(u){return u.active}).length;

    var today=new Date().toDateString();
    var todaySales=activeSales.filter(function(s){return new Date(s.date).toDateString()===today});
    var todayRevenue=todaySales.reduce(function(s,v){return s+v.total},0);
    var todayExpenses=(DB.expenses||[]).filter(function(e){return new Date(e.date).toDateString()===today});
    var todayExpTotal=todayExpenses.reduce(function(s,e){return s+e.amount},0);
    var todayOrdersCost=allOrders.filter(function(o){
      var st=o.status;
      return (st==='Recebido'||st==='Recebido Parcial')&&o.receivedDate&&new Date(o.receivedDate).toDateString()===today;
    }).reduce(function(s,o){return s+o.total},0);
    var todayProfit=todayRevenue-todayExpTotal-todayOrdersCost;
    var expiredCount=DB.products.filter(function(p){var s=getExpiryStatus(p);return s&&s.status==='expired'}).length;
    var criticalCount=DB.products.filter(function(p){var s=getExpiryStatus(p);return s&&s.status==='critical'}).length;

    var now=new Date();
    var monthStart=new Date(now.getFullYear(),now.getMonth(),1);
    var todayOrders=allOrders.filter(function(o){return new Date(o.date).toDateString()===today});
    var todayOrdersValue=todayOrders.reduce(function(s,o){return s+o.total},0);
    var monthOrders=allOrders.filter(function(o){return new Date(o.date)>=monthStart});
    var monthOrdersValue=monthOrders.reduce(function(s,o){return s+o.total},0);
    var pendingOrders=allOrders.filter(function(o){return o.status==='Pendente'}).length;
    var pendingOrdersValue=allOrders.filter(function(o){return o.status==='Pendente'}).reduce(function(s,o){return s+o.total},0);

    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="layout-dashboard" style="width:24px;height:24px;vertical-align:middle"></i> Dashboard</h2><div class="header-actions">'+
      '<button class="btn btn-ghost" onclick="navigateTo(\'pdv\')"><i data-lucide="shopping-cart" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Abrir PDV</button>'+
      '</div></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="banknote"></i></div><div class="sc-value">'+formatMoney(totalRevenue)+'</div><div class="sc-label">Receita Total</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="banknote"></i></div><div class="sc-value" style="color:var(--danger)">'+formatMoney(totalExpenses)+'</div><div class="sc-label">Despesas Total</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="shopping-bag"></i></div><div class="sc-value" style="color:var(--danger)">'+formatMoney(totalOrdersCost)+'</div><div class="sc-label">Pedidos Fornecedores</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="trending-up"></i></div><div class="sc-value" style="color:'+(totalProfit>=0?'var(--success)':'var(--danger)')+'">'+formatMoney(totalProfit)+'</div><div class="sc-label">Lucro Liquido</div><div class="sc-change'+(totalProfit>=0?' sc-up':' sc-down')+'">Vendas − Despesas − Pedidos</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="calendar"></i></div><div class="sc-value">'+formatMoney(todayRevenue)+'</div><div class="sc-label">Vendas Hoje</div><div class="sc-change sc-up">'+todaySales.length+' vendas</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="package"></i></div><div class="sc-value">'+totalProducts+'</div><div class="sc-label">Produtos Cadastrados</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="alert-triangle"></i></div><div class="sc-value" style="color:var(--danger)">'+lowStock+'</div><div class="sc-label">Estoque Baixo</div>'+(lowStock>0?'<div class="sc-change sc-down">Reponha urgentemente!</div>':'<div class="sc-change sc-up">Estoque OK</div>')+'</div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="shopping-cart"></i></div><div class="sc-value">'+totalSales+'</div><div class="sc-label">Total de Vendas</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="tag"></i></div><div class="sc-value">'+formatMoney(totalStockValue)+'</div><div class="sc-label">Valor em Estoque</div></div>'+
      (expiredCount>0||criticalCount>0?'<div class="stat-card" style="cursor:pointer" onclick="navigateTo(\'expiryreport\')"><div class="sc-icon"><i data-lucide="calendar-clock"></i></div><div class="sc-value" style="color:'+(expiredCount>0?'#ff4757':'#f39c12')+'">'+expiredCount+'</div><div class="sc-label">Produtos Vencidos</div>'+(criticalCount>0?'<div class="sc-change sc-down">'+criticalCount+' vencem em 30 dias</div>':'<div class="sc-change sc-up">Ver relatorio</div>')+'</div>':'')+
      '</div>'+
      '<div class="stats-row">'+
      '<div class="stat-card" style="cursor:pointer" onclick="navigateTo(\'supplierorders\')"><div class="sc-icon"><i data-lucide="shopping-bag"></i></div><div class="sc-value" style="color:var(--blue)">'+formatMoney(todayOrdersValue)+'</div><div class="sc-label">Pedidos Hoje</div><div class="sc-change">'+todayOrders.length+' pedido'+(todayOrders.length!==1?'s':'')+'</div></div>'+
      '<div class="stat-card" style="cursor:pointer" onclick="navigateTo(\'supplierorders\')"><div class="sc-icon"><i data-lucide="calendar"></i></div><div class="sc-value" style="color:var(--purple)">'+formatMoney(monthOrdersValue)+'</div><div class="sc-label">Pedidos no Mes</div><div class="sc-change">'+monthOrders.length+' pedido'+(monthOrders.length!==1?'s':'')+'</div></div>'+
      '<div class="stat-card" style="cursor:pointer" onclick="filterSupplierOrders(\'Pendente\');navigateTo(\'supplierorders\')"><div class="sc-icon"><i data-lucide="clock"></i></div><div class="sc-value" style="color:var(--warn)">'+formatMoney(pendingOrdersValue)+'</div><div class="sc-label">Pedidos Pendentes</div><div class="sc-change">'+pendingOrders.length+' aguardando</div></div>'+
      '</div>'+

      '<div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-bottom:24px">'+
      '<div class="settings-card" style="margin:0">'+
      '<h3><i data-lucide="bar-chart-3" style="width:18px;height:18px;vertical-align:middle"></i> Receitas vs Despesas — Ultimos 6 Meses</h3>'+
      renderFinanceChart()+
      '</div>'+
      '<div class="settings-card" style="margin:0">'+
      '<h3><i data-lucide="calendar" style="width:18px;height:18px;vertical-align:middle"></i> Resumo de Hoje</h3>'+
      '<div style="padding:12px 0">'+
      '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="color:var(--txt2)">Receitas (Vendas)</span><span style="font-weight:700;color:var(--success)">'+formatMoney(todayRevenue)+'</span></div>'+
      '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="color:var(--txt2)">Despesas</span><span style="font-weight:700;color:var(--danger)">'+formatMoney(todayExpTotal)+'</span></div>'+
      '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="color:var(--txt2)">Pedidos Fornecedores</span><span style="font-weight:700;color:var(--danger)">'+formatMoney(todayOrdersCost)+'</span></div>'+
      '<div style="display:flex;justify-content:space-between;padding:8px 0;font-weight:700"><span>Lucro</span><span style="color:'+(todayProfit>=0?'var(--success)':'var(--danger)')+'">'+formatMoney(todayProfit)+'</span></div>'+
      '</div></div></div>'+

      '<h3 style="margin-bottom:16px;font-size:18px">⚠️ Produtos com Estoque Baixo</h3>'+
      renderLowStockTable()+

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px">'+
      '<div>'+
      '<h3 style="margin-bottom:16px;font-size:18px"><i data-lucide="bath" style="width:18px;height:18px;vertical-align:middle"></i> Banhos & Tosas de Hoje</h3>'+
      renderTodayBaths()+
      '</div>'+
      '<div>'+
      '<h3 style="margin-bottom:16px;font-size:18px"><i data-lucide="shopping-bag" style="width:18px;height:18px;vertical-align:middle"></i> Pedidos ao Fornecedor — Hoje</h3>'+
      renderTodaySupplierOrders()+
      '</div></div>'+

      '<h3 style="margin:24px 0 16px;font-size:18px"><i data-lucide="ticket" style="width:18px;height:18px;vertical-align:middle"></i> Pacotes com Saldo Baixo</h3>'+
      renderLowPackageBalance();
  }

  function renderTodayBaths(){
    var today=new Date().toDateString();
    var items=(DB.bathGrooming||[]).filter(function(b){
      if(!b.date)return false;
      var s=b.status||'Agendado';
      if(s==='Concluido'||s==='Cancelado')return false;
      return new Date(b.date).toDateString()===today;
    }).sort(function(a,b){return new Date(a.date)-new Date(b.date)});
    if(items.length===0)return '<div class="empty-msg" style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--rl)">Nenhum banho agendado para hoje ✓</div>';
    var html='<div class="table-wrap"><table><thead><tr><th>Hora</th><th>Cliente</th><th>Pet</th><th>Servico</th><th>Status</th></tr></thead><tbody>';
    items.forEach(function(b){
      var client=DB.clients.find(function(c){return c.id===b.clientId});
      var time=b.date?new Date(b.date).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'—';
      var st=b.status||'Agendado';
      var badge=st==='Agendado'?'b-blue':st==='Em andamento'?'b-purple':'b-green';
      var label=st==='Em andamento'?'Em andamento':st;
      html+='<tr><td style="font-weight:700">'+time+'</td><td>'+(client?client.name:'—')+'</td><td>'+b.dogName+'</td><td>'+b.service+'</td><td><span class="badge-sm '+badge+'">'+label+'</span></td></tr>';
    });
    html+='</tbody></table></div>';
    return html;
  }

  function renderTodaySupplierOrders(){
    var today=new Date().toDateString();
    var items=(DB.supplierOrders||[]).filter(function(o){
      return new Date(o.date).toDateString()===today;
    }).sort(function(a,b){return new Date(b.date)-new Date(a.date)});
    if(items.length===0)return '<div class="empty-msg" style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--rl)">Nenhum pedido de fornecedor hoje ✓</div>';
    var html='<div class="table-wrap"><table><thead><tr><th>#</th><th>Fornecedor</th><th>Itens</th><th>Total</th><th>Status</th></tr></thead><tbody>';
    items.forEach(function(o){
      var sup=DB.suppliers.find(function(s){return s.id===o.supplierId});
      var st=o.status==='Pendente'?'b-blue':o.status==='Recebido'?'b-green':o.status==='Recebido Parcial'?'b-purple':'b-red';
      html+='<tr><td style="font-weight:700">#'+o.id+'</td><td>'+(sup?sup.name:'—')+'</td><td>'+o.items.length+'</td><td style="font-weight:700;color:var(--accent)">'+formatMoney(o.total)+'</td><td><span class="badge-sm '+st+'">'+o.status+'</span></td></tr>';
    });
    html+='</tbody></table></div>';
    return html;
  }

  function renderLowPackageBalance(){
    var now=new Date();
    var items=(DB.clientPackages||[]).filter(function(p){
      return p.active&&p.balance>0&&(!p.expiryDate||new Date(p.expiryDate)>=now);
    }).sort(function(a,b){return a.balance-b.balance}).slice(0,5);
    if(items.length===0)return '<div class="empty-msg" style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--rl)">Nenhum pacote com saldo baixo ✓</div>';
    var html='<div class="table-wrap"><table><thead><tr><th>Cliente</th><th>Pacote</th><th>Saldo</th><th>Validade</th></tr></thead><tbody>';
    items.forEach(function(p){
      var client=DB.clients.find(function(c){return c.id===p.clientId});
      var threshold=(p.price||0)*0.3;
      var low=p.balance<=threshold;
      html+='<tr><td>'+(client?client.name:'—')+'</td><td>Pacote #'+p.id+(p.serviceName?' — '+p.serviceName:'')+'</td><td style="font-weight:700;color:'+(low?'var(--danger)':'var(--warn)')+'">'+formatMoney(p.balance)+'</td><td style="color:var(--txt2)">'+(p.expiryDate?new Date(p.expiryDate).toLocaleDateString('pt-BR'):'—')+'</td></tr>';
    });
    html+='</tbody></table></div>';
    return html;
  }

  function renderFinanceChart(){
    var now=new Date();
    var months=[];
    var monthNames=['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    for(var i=5;i>=0;i--){
      var d=new Date(now.getFullYear(),now.getMonth()-i,1);
      months.push({month:d.getMonth(),year:d.getFullYear(),label:monthNames[d.getMonth()]+'/'+String(d.getFullYear()).slice(2)});
    }
    var data=months.map(function(ms){
      var rev=DB.sales.filter(function(s){return s.status!=='cancelado'}).filter(function(s){var d=new Date(s.date);return d.getMonth()===ms.month&&d.getFullYear()===ms.year}).reduce(function(s,v){return s+v.total},0);
      var exp=(DB.expenses||[]).filter(function(e){var d=new Date(e.date);return d.getMonth()===ms.month&&d.getFullYear()===ms.year}).reduce(function(s,e){return s+e.amount},0);
      return{label:ms.label,revenue:rev,expense:exp};
    });
    var maxVal=Math.max.apply(null,data.map(function(d){return Math.max(d.revenue,d.expense)}));
    if(maxVal===0)maxVal=1;
    var barWidth=Math.floor(100/(data.length*3));
    if(barWidth<8)barWidth=8;
    var html='<div style="display:flex;align-items:flex-end;gap:8px;height:200px;padding:20px 0">';
    data.forEach(function(d){
      var revH=maxVal>0?(d.revenue/maxVal)*160:0;
      var expH=maxVal>0?(d.expense/maxVal)*160:0;
      html+='<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">'+
        '<div style="display:flex;gap:3px;align-items:flex-end;height:160px">'+
        '<div style="width:'+(barWidth/2)+'px;height:'+revH+'px;background:var(--accent);border-radius:3px 3px 0 0;min-height:2px;transition:height .5s" title="Receita: '+formatMoney(d.revenue)+'"></div>'+
        '<div style="width:'+(barWidth/2)+'px;height:'+expH+'px;background:var(--danger);border-radius:3px 3px 0 0;min-height:2px;transition:height .5s" title="Despesa: '+formatMoney(d.expense)+'"></div>'+
        '</div>'+
        '<span style="font-size:10px;color:var(--txt2);font-weight:600">'+d.label+'</span>'+
        '</div>';
    });
    html+='</div>'+
      '<div style="display:flex;gap:16px;justify-content:center;font-size:11px;color:var(--txt2)">'+
      '<span><span style="display:inline-block;width:12px;height:12px;background:var(--accent);border-radius:2px;vertical-align:middle;margin-right:4px"></span>Receita</span>'+
      '<span><span style="display:inline-block;width:12px;height:12px;background:var(--danger);border-radius:2px;vertical-align:middle;margin-right:4px"></span>Despesa</span>'+
      '</div>';
    return html;
  }

  function renderLowStockTable(){
    var items=DB.products.filter(function(p){return p.stock<=p.minStock});
    if(items.length===0)return '<div class="empty-msg" style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--rl)">Todos os produtos com estoque adequado ✓</div>';
    var html='<div class="table-wrap"><table><thead><tr><th>Produto</th><th>Estoque</th><th>Minimo</th><th>Status</th></tr></thead><tbody>';
    items.forEach(function(p){
      html+='<tr><td>'+p.emoji+' '+p.name+'</td><td>'+p.stock+' '+p.unit+'</td><td>'+p.minStock+' '+p.unit+'</td><td><span class="badge-sm b-red">BAIXO</span></td></tr>';
    });
    html+='</tbody></table></div>';
    return html;
  }

  // ===== VALIDADE / EXPIRY =====
  function getExpiryStatus(p){
    if(!p||!p.expiryDate)return null;
    var now=new Date();
    now.setHours(0,0,0,0);
    var exp=new Date(p.expiryDate+'T00:00:00');
    var diff=Math.floor((exp-now)/(1000*60*60*24));
    if(diff<0)return{status:'expired',label:'VENCIDO',color:'#ff4757',bg:'rgba(255,71,87,.15)',days:diff};
    if(diff<=30)return{status:'critical',label:'VENCE EM '+diff+' DIAS',color:'#ff6348',bg:'rgba(255,99,72,.15)',days:diff};
    if(diff<=90)return{status:'warning',label:'VENCE EM '+diff+' DIAS',color:'#f39c12',bg:'rgba(243,156,18,.15)',days:diff};
    return{status:'ok',label:'VALIDO',color:'#2ed573',bg:'rgba(46,213,115,.15)',days:diff};
  }
  function formatExpiryDate(d){
    if(!d)return'';
    var parts=d.split('-');
    return parts[2]+'/'+parts[1]+'/'+parts[0];
  }

  // ===== SCALE / BALANCA =====
  var scaleState={connected:false,type:'',port:null,reader:null,weight:0,stable:false,unit:'kg',lastUpdate:0,cancelRead:false,usbBuffer:'',usbTimer:null,lastRaw:''};

  function isWeightProduct(p){if(!p)return false;if(p.weighable===true)return true;if(p.weighable===false)return false;return false}
  function getScaleCfg(){return DB.settings&&DB.settings.scale?DB.settings.scale:{mode:'serial',port:'',baudRate:9600,dataBits:8,stopBits:1,parity:'none',protocol:'toledo',unitDefault:'kg',stableTimeout:2000,decimals:3}}
  function scaleWeightDisplay(){
    var cfg=getScaleCfg();
    var w=scaleState.weight;
    var decimals=cfg.decimals||3;
    return w.toFixed(decimals);
  }

  function parseToledo(str){
    var m=str.match(/(-?\d+[\.,]\d+)/);
    if(m){
      var val=parseFloat(m[1].replace(',','.'));
      if(val<0)val=0;
      return{weight:val,stable:val>0,raw:str.trim()};
    }
    return{weight:0,stable:false,raw:str.trim()};
  }

  function parseFilizola(str){
    var m=str.match(/(-?\d+[\.,]\d+)/);
    if(m){
      var val=parseFloat(m[1].replace(',','.'));
      if(val<0)val=0;
      return{weight:val,stable:val>0,raw:str.trim()};
    }
    return{weight:0,stable:false,raw:str.trim()};
  }

  function parseGeneric(str){
    var m=str.match(/(-?\d+[\.,]\d+)/);
    if(m){
      var val=parseFloat(m[1].replace(',','.'));
      if(val<0)val=0;
      return{weight:val,stable:val>0,raw:str.trim()};
    }
    return{weight:0,stable:false,raw:str.trim()};
  }

  function parseScaleData(str){
    var cfg=getScaleCfg();
    switch(cfg.protocol){
      case 'toledo':return parseToledo(str);
      case 'filizola':return parseFilizola(str);
      default:return parseGeneric(str);
    }
  }

  window.scaleConnect=async function scaleConnect(){
    if(!navigator.serial){
      toast('Seu navegador nao suporta Web Serial API. Use Chrome ou Edge.','error');
      return false;
    }
    try{
      var cfg=getScaleCfg();
      var port=null;
      var previouslyAuthorized=await navigator.serial.getPorts();
      if(previouslyAuthorized.length>0){
        port=previouslyAuthorized[0];
      }
      if(!port){
        port=await navigator.serial.requestPort();
      }
      await port.open({
        baudRate:cfg.baudRate||9600,
        dataBits:cfg.dataBits||8,
        stopBits:cfg.stopBits||1,
        parity:cfg.parity||'none'
      });
      scaleState.port=port;
      scaleState.connected=true;
      scaleState.type='serial';
      scaleState.cancelRead=false;
      scaleState.weight=0;
      scaleState.stable=false;
      toast('Balanca serial conectada!','success');
      logActivity('SCALE_CONNECT','Balanca serial conectada — porta: '+(cfg.port||'auto')+' | protocolo: '+cfg.protocol);
      updateScalePanel();
      scaleReadLoop();
      return true;
    }catch(e){
      if(e.name!=='NotFoundError'){
        toast('Erro ao conectar balanca: '+e.message,'error');
        console.error('Scale connect error:',e);
      }
      return false;
    }
  }

  async function scaleAutoConnect(){
    var cfg=getScaleCfg();
    if(!cfg.mode||cfg.mode==='serial'){
      if(!navigator.serial)return;
      try{
        var ports=await navigator.serial.getPorts();
        if(ports.length>0){
          await scaleConnect();
        }
      }catch(e){}
    }else if(cfg.mode==='usb'){
      scaleConnectUSB();
    }
  }

  window.scaleDisconnect=async function scaleDisconnect(){
    scaleState.cancelRead=true;
    if(scaleState.reader){
      try{await scaleState.reader.cancel();}catch(e){}
      try{scaleState.reader.releaseLock();}catch(e){}
      scaleState.reader=null;
    }
    if(scaleState.port){
      try{await scaleState.port.close();}catch(e){}
      scaleState.port=null;
    }
    scaleState.connected=false;
    scaleState.type='';
    scaleState.weight=0;
    scaleState.stable=false;
    toast('Balanca desconectada','info');
    logActivity('SCALE_DISCONNECT','Balanca serial desconectada');
    updateScalePanel();
  }

  // ===== USB SCALE (Keyboard Emulation) =====
  var usbScaleKeyHandler=function(e){
    if(!scaleState.connected||scaleState.type!=='usb')return;
    var key=e.key;
    if(key>='0'&&key<='9'){
      e.preventDefault();
      scaleState.usbBuffer+=key;
      scaleState.weight=parseFloat(scaleState.usbBuffer)||0;
      scaleState.stable=false;
      scaleState.lastUpdate=Date.now();
      updateScalePanel();
      updateWeightModalLive();
    }else if(key==='.'||key===','){
      e.preventDefault();
      scaleState.usbBuffer+='.';
      scaleState.stable=false;
    }else if(key==='Enter'){
      e.preventDefault();
      if(scaleState.usbBuffer.length>0){
        scaleState.weight=parseFloat(scaleState.usbBuffer)||0;
        scaleState.stable=true;
        scaleState.lastUpdate=Date.now();
        scaleState.usbBuffer='';
        updateScalePanel();
        updateWeightModalLive();
      }
    }else if(key==='Backspace'){
      e.preventDefault();
      scaleState.usbBuffer=scaleState.usbBuffer.slice(0,-1);
      scaleState.weight=parseFloat(scaleState.usbBuffer)||0;
      updateScalePanel();
      updateWeightModalLive();
    }else if(key==='Escape'){
      e.preventDefault();
      scaleState.usbBuffer='';
      scaleState.weight=0;
      scaleState.stable=false;
      updateScalePanel();
      updateWeightModalLive();
    }
  };

  window.scaleConnectUSB=function scaleConnectUSB(){
    scaleState.connected=true;
    scaleState.type='usb';
    scaleState.weight=0;
    scaleState.stable=false;
    scaleState.usbBuffer='';
    scaleState.lastUpdate=Date.now();
    document.addEventListener('keydown',usbScaleKeyHandler);
    toast('Balanca USB ativada! Pesa o produto e pressione Enter.','success');
    logActivity('SCALE_CONNECT_USB','Balanca USB ativada (emulacao teclado)');
    updateScalePanel();
    return true;
  }

  window.scaleDisconnectUSB=function scaleDisconnectUSB(){
    scaleState.connected=false;
    scaleState.type='';
    scaleState.weight=0;
    scaleState.stable=false;
    scaleState.usbBuffer='';
    document.removeEventListener('keydown',usbScaleKeyHandler);
    toast('Balanca USB desconectada','info');
    logActivity('SCALE_DISCONNECT_USB','Balanca USB desconectada');
    updateScalePanel();
  }

  async function scaleReadLoop(){
    if(!scaleState.port||!scaleState.connected)return;
    try{
      var decoder=new TextDecoderStream();
      var readableClosed=scaleState.port.readable.pipeTo(decoder.writable);
      scaleState.reader=decoder.readable.getReader();
      var cfg=getScaleCfg();
      var buffer='';

      while(true){
        var{value,done}=await scaleState.reader.read();
        if(done||scaleState.cancelRead)break;
        if(value){
          buffer+=value;
          if(buffer.indexOf('\n')!==-1||buffer.indexOf('\r')!==-1||buffer.length>50){
            var parsed=parseScaleData(buffer);
            scaleState.weight=parsed.weight;
            scaleState.stable=parsed.stable;
            scaleState.lastUpdate=Date.now();
            scaleState.unit=cfg.unitDefault||'kg';
            scaleState.lastRaw=parsed.raw;
            updateScalePanel();
            updateWeightModalLive();
            buffer='';
          }
        }
      }
    }catch(e){
      if(!scaleState.cancelRead){
        console.error('Scale read error:',e);
        scaleState.connected=false;
        scaleState.port=null;
        scaleState.reader=null;
        toast('Conexao com balanca perdida!','error');
        updateScalePanel();
      }
    }
  }

  function updateScalePanel(){
    var panel=document.getElementById('scalePanel');
    if(!panel)return;
    var dot=panel.querySelector('.scale-dot');
    var swd=panel.querySelector('.swd-value');
    var info=panel.querySelector('.scale-info');
    var statusLabel=panel.querySelector('.scale-status-text');
    var connBtns=panel.querySelector('.scale-actions');
    var cfg=getScaleCfg();
    var modeLabel=cfg.mode==='usb'?'USB (Teclado)':'Serial (RS-232)';

      if(scaleState.connected){
      var typeLabel=scaleState.type==='usb'?'USB (Teclado)':'Serial (COM)';
      var protoLabel=scaleState.type==='usb'?'Emulacao de teclado':'Protocolo: '+cfg.protocol.toUpperCase();
      var rawInfo=scaleState.lastRaw?'('+scaleState.lastRaw.trim()+')':'';
      dot.className='scale-dot '+(scaleState.stable?'stable':'on');
      swd.textContent=scaleWeightDisplay();
      var statusText=scaleState.stable?'Estavel':'Lendo...';
      if(scaleState.weight===0)statusText='Sem peso';
      if(statusLabel)statusLabel.textContent=statusText+' ('+typeLabel+')';
      if(info){
        info.innerHTML='<span>'+protoLabel+'</span>'+
          '<span>Tipo: '+typeLabel+'</span>'+
          '<span>Raw: '+rawInfo+'</span>';
      }
      if(connBtns){
        connBtns.innerHTML='<button class="scale-btn-connect disconnect" onclick="'+(scaleState.type==='usb'?'scaleDisconnectUSB()':'scaleDisconnect()')+'">Desconectar</button>';
      }
    }else{
      dot.className='scale-dot off';
      swd.textContent='0.000';
      if(statusLabel)statusLabel.textContent='Offline';
      if(info)info.innerHTML='<span>Modo: '+modeLabel+'</span><span>Clique para conectar</span>';
      if(connBtns){
        if(cfg.mode==='usb'){
           connBtns.innerHTML='<button class="scale-btn-connect connect" onclick="scaleConnectUSB()" title="Ativar balanca USB (emulacao teclado)"><i data-lucide="plug" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Conectar USB</button>';
        }else{
          connBtns.innerHTML='<button class="scale-btn-connect connect" onclick="scaleConnect()" title="Conectar balanca serial RS-232"><i data-lucide="radio" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Conectar Serial</button>';
        }
      }
    }
  }

  function buildScalePanelHTML(){
    var cfg=getScaleCfg();
    var modeLabel=cfg.mode==='usb'?'USB (Teclado)':'Serial (RS-232)';
    var connLabel=cfg.mode==='usb'?'<i data-lucide="plug" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Conectar USB':'<i data-lucide="radio" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Conectar Serial';
    var connFn=cfg.mode==='usb'?'scaleConnectUSB()':'scaleConnect()';
    return '<div class="scale-panel" id="scalePanel">'+
      '<div class="scale-status"><div class="scale-dot off"></div><span class="scale-status-text">Offline</span></div>'+
      '<div class="scale-weight-display"><div class="swd-label">Peso Atual</div><div><span class="swd-value">0.000</span><span class="swd-unit">kg</span></div></div>'+
      '<div class="scale-info"><span>Modo: '+modeLabel+'</span><span>Clique para conectar</span></div>'+
      '<div class="scale-actions">'+
      '<button class="scale-btn-connect connect" onclick="'+connFn+'" title="Conectar balanca">'+connLabel+'</button>'+
      '</div></div>';
  }

  // Weight modal state
  var weightModalState={open:false,productId:null,liveWeight:0};

  window.openWeightModal=function(productId){
    var prod=DB.products.find(function(p){return p.id===productId});
    if(!prod)return;
    weightModalState.open=true;
    weightModalState.productId=productId;
    weightModalState.liveWeight=scaleState.connected?scaleState.weight:0;
    var cfg=getScaleCfg();
    var unit=prod.unit||cfg.unitDefault||'kg';
    var unitLabel=unit==='kg'?'kg':unit==='g'?'g':'ml';
    var decimals=unit==='kg'?3:0;
    var hasScale=scaleState.connected&&(scaleState.type==='serial'||scaleState.type==='usb');
    var isUSB=scaleState.connected&&scaleState.type==='usb';
    var pricePerUnit=prod.price;
    if(unit==='g'||unit==='ml')pricePerUnit=prod.price/1000;
    var body;
    if(hasScale){
      var scaleTypeMsg=isUSB?'⚖️ Balanca USB — pese e pressione Enter':'⚖️ Balanca conectada — peso em tempo real';
      body=
        '<div class="swm-body scale-weight-modal">'+
        '<div class="swm-product">'+prod.emoji+' '+prod.name+'</div>'+
        '<div class="swm-weight" id="swmLiveWeight">'+weightModalState.liveWeight.toFixed(decimals)+'</div>'+
        '<div class="swm-unit">'+unitLabel+'</div>'+
        '<div class="swm-status live" id="swmStatus">'+scaleTypeMsg+'</div>'+
        '<div class="swm-input-row">'+
        '<label style="font-size:13px;color:var(--txt2);font-weight:600">Peso:</label>'+
        '<input type="number" class="swm-input" id="swmWeightInput" step="'+(unit==='kg'?'0.001':'1')+'" min="0" value="'+weightModalState.liveWeight.toFixed(decimals)+'" placeholder="0'+(unit==='kg'?'.000':'')+'">'+
        '<span class="swm-unit-label">'+unitLabel+'</span>'+
        '</div>'+
        '<div class="swm-price" id="swmPriceInfo">Preco: '+formatMoney(prod.price)+'/'+(unit==='kg'?'kg':unit==='g'?'1000g':'1000ml')+
        ' | <strong id="swmSubtotal">'+formatMoney(0)+'</strong></div>'+
        '<div class="swm-actions">'+
        '<button class="btn btn-ghost" onclick="closeWeightModal()">Cancelar</button>'+
        '<button class="btn btn-primary" onclick="confirmWeightItem()">✔ Adicionar ao Carrinho</button>'+
        '</div></div>';
    }else{
      body=
        '<div class="swm-body scale-weight-modal">'+
        '<div class="swm-product">'+prod.emoji+' '+prod.name+'</div>'+
        '<div style="font-size:12px;color:var(--txt2);margin-bottom:4px">Preco unitario: <strong>'+formatMoney(pricePerUnit)+'</strong>/'+unitLabel+'</div>'+
        '<div class="swm-input-row" style="margin-top:12px">'+
        '<label style="font-size:14px;color:var(--txt);font-weight:700">Digite o peso:</label>'+
        '<input type="number" class="swm-input" id="swmWeightInput" step="'+(unit==='kg'?'0.001':'1')+'" min="0" value="" autofocus placeholder="0.000" style="font-size:28px;width:200px">'+
        '<span class="swm-unit-label" style="font-size:18px">'+unitLabel+'</span>'+
        '</div>'+
        '<div class="swm-price" id="swmPriceInfo" style="font-size:16px;margin-top:16px;padding:16px">'+
        '<div style="color:var(--txt2);margin-bottom:4px">Subtotal</div>'+
        '<strong id="swmSubtotal" style="font-size:24px;color:var(--accent)">'+formatMoney(0)+'</strong>'+
        '</div>'+
        '<div class="swm-actions" style="margin-top:16px">'+
        '<button class="btn btn-ghost" onclick="closeWeightModal()">Cancelar</button>'+
        '<button class="btn btn-primary" style="padding:14px 32px;font-size:15px" onclick="confirmWeightItem()">✔ Adicionar ao Carrinho</button>'+
        '</div></div>';
    }

    openModal('Pesar Produto',body,'','modal-weight');
    setTimeout(function(){
      var input=document.getElementById('swmWeightInput');
      if(input){
        input.focus();
        input.select();
        input.oninput=function(){
          var val=parseFloat(input.value)||0;
          var sub=val*pricePerUnit;
          var subEl=document.getElementById('swmSubtotal');
          if(subEl)subEl.textContent=formatMoney(sub);
        };
        input.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();confirmWeightItem()}};
      }
      if(hasScale){
        var si=setInterval(function(){
          if(!weightModalState.open){clearInterval(si);return}
          var lw=document.getElementById('swmLiveWeight');
          var st=document.getElementById('swmStatus');
          var inp=document.getElementById('swmWeightInput');
          if(lw)lw.textContent=scaleState.weight.toFixed(decimals);
          if(st){
            if(isUSB){
              st.textContent=scaleState.stable?'⚖️ Peso estavel — '+scaleState.weight.toFixed(decimals)+' '+unitLabel:(scaleState.usbBuffer?'⚖️ Recebendo peso... '+scaleState.usbBuffer:'⚖️ Pese o produto e pressione Enter');
            }else{
              st.textContent=scaleState.stable?'⚖️ Peso estavel — '+scaleState.weight.toFixed(decimals)+' '+unitLabel:'⚖️ Aguardando peso estavel...';
            }
            st.className='swm-status '+(scaleState.stable?'live':'');
          }
          if(inp&&scaleState.stable&&scaleState.weight>0){inp.value=scaleState.weight.toFixed(decimals);inp.oninput()}
        },200);
        weightModalState._si=si;
      }
    },100);
  };

  window.updateWeightModalLive=function(){
    if(!weightModalState.open)return;
    var lw=document.getElementById('swmLiveWeight');
    var st=document.getElementById('swmStatus');
    var inp=document.getElementById('swmWeightInput');
    var prod=DB.products.find(function(p){return p.id===weightModalState.productId});
    var decimals=(prod&&prod.unit==='kg')?3:0;
    if(lw)lw.textContent=scaleState.weight.toFixed(decimals);
    if(st){
      st.textContent=scaleState.stable?'⚖️ Peso estavel — '+scaleState.weight.toFixed(decimals)+' kg':'⚖️ Aguardando peso...';
      st.className='swm-status '+(scaleState.stable?'live':'');
    }
    if(inp&&scaleState.stable&&scaleState.weight>0){inp.value=scaleState.weight.toFixed(decimals);inp.oninput()}
  };

  window.closeWeightModal=function(){
    weightModalState.open=false;
    weightModalState.productId=null;
    if(weightModalState._si){clearInterval(weightModalState._si);weightModalState._si=null}
    closeModal();
  };

  window.confirmWeightItem=function(){
    var prod=DB.products.find(function(p){return p.id===weightModalState.productId});
    if(!prod){toast('Erro ao adicionar produto','error');return}
    var input=document.getElementById('swmWeightInput');
    var weight=parseFloat(input?input.value:0);
    if(!weight||weight<=0){toast('Informe um peso valido!','error');return}
    var exists=cartItems.find(function(c){return c.id===prod.id});
    if(exists){
      exists.qty=parseFloat((exists.qty+weight).toFixed(3));
    }else{
      cartItems.push({id:prod.id,qty:parseFloat(weight.toFixed(3)),isWeight:true});
    }
    closeWeightModal();
    renderPdvCart();
    toast(prod.emoji+' '+prod.name+' ('+weight+ (prod.unit||'kg') +') adicionado!','success');
  };

  // ===== MODO VENDA (PDV Simplificado) =====
  var saleModeItems=[];
  function renderSaleMode(m){
    var cats=[...new Set(DB.products.map(function(p){return p.cat}))];
    m.innerHTML=
      '<div class="sale-mode">'+
      '<div class="sale-mode-header">'+
      '<div class="sale-mode-topbar">'+
      '<input type="text" class="sale-mode-search" id="saleModeSearch" placeholder="Buscar produto..." autocomplete="off">'+
      '<div class="sale-mode-cats" id="saleModeCats">'+
      '<button class="sm-cat active" data-cat="Todos">Todos</button>'+
      cats.map(function(c){return '<button class="sm-cat" data-cat="'+c+'">'+c+'</button>'}).join('')+
      '</div>'+
      '</div>'+
      '<div class="sale-mode-total-bar" id="saleModeTotalBar">'+
      '<span class="sm-total-label">TOTAL</span>'+
      '<span class="sm-total-value" id="saleModeTotal">R$ 0,00</span>'+
      '</div>'+
      '</div>'+
      '<div class="sale-mode-body">'+
      '<div class="sale-mode-grid" id="saleModeGrid"></div>'+
      '<div class="sale-mode-cart" id="saleModeCart">'+
      '<div class="sm-cart-empty">Nenhum item</div>'+
      '</div>'+
      '</div>'+
      '<div class="sale-mode-footer">'+
      '<div class="sm-footer-actions">'+
      '<button class="btn btn-ghost sm-btn-clear" onclick="saleModeClear()"><i data-lucide="trash-2" style="width:16px;height:16px"></i> Limpar</button>'+
      '<button class="btn btn-primary sm-btn-pay" onclick="saleModePay()"><i data-lucide="check" style="width:18px;height:18px"></i> Finalizar</button>'+
      '</div>'+
      '<div class="sm-pay-btns">'+
      '<button class="sm-pay-btn" onclick="saleModeQuickPay(\'dinheiro\')" style="--btn-color:#22c55e">💵</button>'+
      '<button class="sm-pay-btn" onclick="saleModeQuickPay(\'cartao\')" style="--btn-color:#f59e0b">💳</button>'+
      '<button class="sm-pay-btn" onclick="saleModeQuickPay(\'pix\')" style="--btn-color:#8b5cf6">📱</button>'+
      '<button class="sm-pay-btn" onclick="saleModeQuickPay(\'debito\')" style="--btn-color:#3b82f6">🏦</button>'+
      '</div>'+
      '</div>'+
      '</div>';

    renderSaleModeProducts('Todos');
    renderSaleModeCart();

    $('saleModeSearch').addEventListener('input',function(){
      var activeCat=document.querySelector('.sm-cat.active');
      renderSaleModeProducts(activeCat?activeCat.dataset.cat:'Todos');
    });
    document.querySelectorAll('.sm-cat').forEach(function(btn){
      btn.addEventListener('click',function(){
        document.querySelectorAll('.sm-cat').forEach(function(b){b.classList.remove('active')});
        btn.classList.add('active');
        renderSaleModeProducts(btn.dataset.cat);
      });
    });
    setTimeout(function(){
      if($('modalBg')&&$('modalBg').classList.contains('open'))return;
      var s=$('saleModeSearch');if(s)s.focus();
    },300);
  }

  function renderSaleModeProducts(cat){
    var grid=$('saleModeGrid');if(!grid)return;
    var search=(document.getElementById('saleModeSearch')?document.getElementById('saleModeSearch').value:'').trim().toLowerCase();
    var items=DB.products.filter(function(p){
      if(p.stock<=0)return false;
      var exp=getExpiryStatus(p);if(exp&&exp.status==='expired')return false;
      if(cat!=='Todos'&&p.cat!==cat)return false;
      if(!search)return true;
      return p.name.toLowerCase().includes(search)||(p.barcode&&p.barcode.includes(search));
    });
    grid.innerHTML=items.map(function(p){
      var hasPromo=p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price;
      var price=hasPromo?p.promoPrice:p.price;
      var promoBadge=hasPromo?'<div class="sm-promo-badge">PROMO</div>':'';
      return '<div class="sm-item" onclick="saleModeAdd('+p.id+')">'+promoBadge+
      '<div class="sm-item-emoji">'+p.emoji+'</div>'+
      '<div class="sm-item-name">'+p.name+'</div>'+
      '<div class="sm-item-price">'+formatMoney(price)+'</div>'+
      (isWeightProduct(p)?'<div class="sm-item-peso">⚖ PESO</div>':'')+
      '</div>';
    }).join('');
    if(items.length===0)grid.innerHTML='<div class="sm-empty">Nenhum produto</div>';
  }

  window.saleModeAdd=function(id){
    var prod=DB.products.find(function(p){return p.id===id});
    if(!prod||prod.stock<=0)return;
    if(isWeightProduct(prod)){openWeightModalSaleMode(id);return}
    var exists=saleModeItems.find(function(c){return c.id===id});
    if(exists){
      if(exists.qty>=prod.stock){toast('Estoque insuficiente!','error');return}
      exists.qty++;
    }else{
      saleModeItems.push({id:id,qty:1});
    }
    renderSaleModeCart();
  };

  function openWeightModalSaleMode(productId){
    weightModalState.open=true;
    weightModalState.productId=productId;
    weightModalState.liveWeight=scaleState.connected?scaleState.weight:0;
    var prod=DB.products.find(function(p){return p.id===productId});
    if(!prod)return;
    var cfg=getScaleCfg();
    var unit=prod.unit||cfg.unitDefault||'kg';
    var unitLabel=unit==='kg'?'kg':unit==='g'?'g':'ml';
    var decimals=unit==='kg'?3:0;
    var pricePerUnit=prod.price;
    if(unit==='g'||unit==='ml')pricePerUnit=prod.price/1000;
    var body=
      '<div class="swm-body scale-weight-modal">'+
      '<div class="swm-product">'+prod.emoji+' '+prod.name+'</div>'+
      '<div style="font-size:12px;color:var(--txt2);margin-bottom:4px">Preco: <strong>'+formatMoney(pricePerUnit)+'</strong>/'+unitLabel+'</div>'+
      '<div class="swm-input-row" style="margin-top:12px">'+
      '<label style="font-size:14px;color:var(--txt);font-weight:700">Peso:</label>'+
      '<input type="number" class="swm-input" id="swmWeightInput" step="'+(unit==='kg'?'0.001':'1')+'" min="0" value="" autofocus placeholder="0.000" style="font-size:28px;width:200px">'+
      '<span class="swm-unit-label" style="font-size:18px">'+unitLabel+'</span>'+
      '</div>'+
      '<div class="swm-price" id="swmPriceInfo" style="font-size:16px;margin-top:16px;padding:16px">'+
      '<div style="color:var(--txt2);margin-bottom:4px">Subtotal</div>'+
      '<strong id="swmSubtotal" style="font-size:24px;color:var(--accent)">'+formatMoney(0)+'</strong>'+
      '</div>'+
      '<div class="swm-actions" style="margin-top:16px">'+
      '<button class="btn btn-ghost" onclick="closeWeightModal()">Cancelar</button>'+
      '<button class="btn btn-primary" style="padding:14px 32px;font-size:15px" onclick="confirmWeightItemSaleMode()">✔ Adicionar</button>'+
      '</div></div>';

    openModal('Pesar Produto',body,'','modal-weight');
    setTimeout(function(){
      var input=document.getElementById('swmWeightInput');
      if(input){
        input.focus();input.select();
        input.oninput=function(){
          var val=parseFloat(input.value)||0;
          var sub=val*pricePerUnit;
          var subEl=document.getElementById('swmSubtotal');
          if(subEl)subEl.textContent=formatMoney(sub);
        };
        input.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();confirmWeightItemSaleMode()}};
      }
    },100);
  }

  window.confirmWeightItemSaleMode=function(){
    var prod=DB.products.find(function(p){return p.id===weightModalState.productId});
    if(!prod){toast('Erro ao adicionar produto','error');return}
    var input=document.getElementById('swmWeightInput');
    var weight=parseFloat(input?input.value:0);
    if(!weight||weight<=0){toast('Informe um peso valido!','error');return}
    var exists=saleModeItems.find(function(c){return c.id===prod.id});
    if(exists){
      exists.qty=parseFloat((exists.qty+weight).toFixed(3));
    }else{
      saleModeItems.push({id:prod.id,qty:parseFloat(weight.toFixed(3)),isWeight:true});
    }
    weightModalState.open=false;
    closeModal();
    renderSaleModeCart();
    toast(prod.emoji+' '+prod.name+' adicionado!','success');
  };

  function renderSaleModeCart(){
    var el=$('saleModeCart');if(!el)return;
    if(saleModeItems.length===0){el.innerHTML='<div class="sm-cart-empty">Nenhum item</div>';$('saleModeTotal').textContent='R$ 0,00';return}
    var total=0;
    el.innerHTML=saleModeItems.map(function(c,i){
      var p=DB.products.find(function(x){return x.id===c.id});
      if(!p)return'';
      var unitPrice=(p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price)?p.promoPrice:p.price;
      var sub=unitPrice*c.qty;
      var isW=isWeightProduct(p);
      var unitLabel=isW?(p.unit||'kg'):'un';
      var qtyLabel=isW?c.qty.toFixed(p.unit==='kg'?3:0)+' '+unitLabel:'x'+c.qty;
      total+=sub;
      return '<div class="sm-cart-item">'+
      '<span class="sm-ci-emoji">'+p.emoji+'</span>'+
      '<div class="sm-ci-info"><span class="sm-ci-name">'+p.name+'</span><span class="sm-ci-price">'+formatMoney(sub)+'</span></div>'+
      '<div class="sm-ci-qty"><button onclick="saleModeChangeQty('+i+',-1)">-</button><span>'+qtyLabel+'</span><button onclick="saleModeChangeQty('+i+',1)">+</button></div>'+
      '</div>';
    }).join('');
    $('saleModeTotal').textContent=formatMoney(total);
  }

  window.saleModeChangeQty=function(idx,delta){
    var item=saleModeItems[idx];
    var prod=DB.products.find(function(p){return p.id===item.id});
    if(isWeightProduct(prod)){
      var step=prod.unit==='kg'?0.1:100;
      item.qty=parseFloat((item.qty+delta*step).toFixed(3));
    }else{
      item.qty+=delta;
    }
    if(item.qty<=0)saleModeItems.splice(idx,1);
    else if(prod&&item.qty>prod.stock){item.qty=prod.stock;toast('Limite de estoque!','error')}
    renderSaleModeCart();
  };

  window.saleModeClear=function(){saleModeItems=[];renderSaleModeCart()};

  window.saleModePay=function(){
    if(saleModeItems.length===0){toast('Adicione itens primeiro!','error');return}
    var total=saleModeItems.reduce(function(s,c){
      var p=DB.products.find(function(x){return x.id===c.id});
      var unitPrice=(p&&p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price)?p.promoPrice:p.price;
      return s+(p?unitPrice*c.qty:0);
    },0);
    var itemsHTML=saleModeItems.map(function(c){
      var p=DB.products.find(function(x){return x.id===c.id});
      var unitPrice=(p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price)?p.promoPrice:p.price;
      var isW=isWeightProduct(p);
      var qtyText=isW?c.qty.toFixed(3)+' '+(p.unit||'kg'):(c.qty===1?'x1':'x'+c.qty);
      return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px">'+
        '<span>'+p.name+' '+qtyText+'</span>'+
        '<span style="font-weight:700">'+formatMoney(unitPrice*c.qty)+'</span></div>';
    }).join('');
    var body=
      '<div style="text-align:center;margin-bottom:16px">'+
      '<div style="font-size:32px;font-weight:900;color:var(--accent)">'+formatMoney(total)+'</div>'+
      '<div style="font-size:13px;color:var(--txt2)">'+saleModeItems.length+' itens</div></div>'+
      '<div style="max-height:150px;overflow-y:auto;margin-bottom:16px">'+itemsHTML+'</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+
      '<button class="sm-modal-pay-btn" onclick="saleModeFinish(\'dinheiro\')" style="--btn-color:#22c55e">💵 Dinheiro</button>'+
      '<button class="sm-modal-pay-btn" onclick="saleModeFinish(\'cartao\')" style="--btn-color:#f59e0b">💳 Credito</button>'+
      '<button class="sm-modal-pay-btn" onclick="saleModeFinish(\'debito\')" style="--btn-color:#3b82f6">🏦 Debito</button>'+
      '<button class="sm-modal-pay-btn" onclick="saleModeFinish(\'pix\')" style="--btn-color:#8b5cf6">📱 PIX</button>'+
      '</div>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>';
    openModal('Finalizar Venda',body,foot);
  };

  window.saleModeQuickPay=function(method){
    if(saleModeItems.length===0){toast('Adicione itens primeiro!','error');return}
    var total=saleModeItems.reduce(function(s,c){
      var p=DB.products.find(function(x){return x.id===c.id});
      var unitPrice=(p&&p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price)?p.promoPrice:p.price;
      return s+(p?unitPrice*c.qty:0);
    },0);
    var body=
      '<div style="text-align:center;padding:20px 0">'+
      '<div style="font-size:14px;color:var(--txt2);margin-bottom:8px">Total a pagar</div>'+
      '<div style="font-size:36px;font-weight:900;color:var(--accent)">'+formatMoney(total)+'</div>'+
      '<div style="margin-top:12px;font-size:16px;color:var(--txt2)">Forma de pagamento: <strong>'+
      ({dinheiro:'💵 Dinheiro',cartao:'💳 Credito',pix:'📱 PIX',debito:'🏦 Debito'}[method])+'</strong></div></div>';
    window._smConfirmMethod=method;
    var foot=
      '<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>'+
      '<button class="btn btn-primary" onclick="saleModeFinish(window._smConfirmMethod)" style="padding:14px 32px;font-size:16px;font-weight:700"><i data-lucide="check" style="width:18px;height:18px;vertical-align:middle;margin-right:6px"></i>Confirmar</button>';
    openModal('Confirmar Pagamento',body,foot);
  };

  window.saleModeFinish=function(method){
    if(saleModeItems.length===0){toast('Carrinho vazio!','error');return}
    saleModeItems=saleModeItems.filter(function(c){return DB.products.some(function(p){return p.id===c.id})});
    if(saleModeItems.length===0){toast('Carrinho vazio!','error');return}
    var total=saleModeItems.reduce(function(s,c){
      var p=DB.products.find(function(x){return x.id===c.id});
      var unitPrice=(p&&p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price)?p.promoPrice:p.price;
      return s+(p?unitPrice*c.qty:0);
    },0);
    var stockBad=saleModeItems.find(function(c){
      var p=DB.products.find(function(x){return x.id===c.id});
      return !p||p.stock<c.qty;
    });
    if(stockBad){toast('Estoque insuficiente!','error');return}
    var items=saleModeItems.map(function(c){
      var p=DB.products.find(function(x){return x.id===c.id});
      var unitPrice=(p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price)?p.promoPrice:p.price;
      return{productId:p.id,name:p.name,price:unitPrice,originalPrice:p.price,qty:c.qty,subtotal:unitPrice*c.qty,emoji:p.emoji,unit:isWeightProduct(p)?(p.unit||'kg'):'un',isWeight:isWeightProduct(p)};
    });
    var sale={
      id:genId('sale'),
      date:new Date().toISOString(),
      items:items,
      total:total,
      payment:method,
      payments:[{method:method,amount:total}],
      cashier:currentUser.name,
      clientId:currentUser.type==='cliente'?currentUser.id:null,
      status:'concluido'
    };
    items.forEach(function(it){
      var prod=DB.products.find(function(p){return p.id===it.productId});
      if(prod)prod.stock-=it.qty;
    });
    DB.sales.push(sale);
    saveDB();
    var methodLabels={dinheiro:'Dinheiro',cartao:'Credito',pix:'PIX',debito:'Debito'};
    logActivity('VENDA','Venda #'+sale.id+' (Modo Venda) — '+formatMoney(total)+' via '+methodLabels[method]);
    saleModeItems=[];
    closeModal();
    renderSaleModeCart();
    var activeCat=document.querySelector('.sm-cat.active');
    renderSaleModeProducts(activeCat?activeCat.dataset.cat:'Todos');
    toast('Venda #'+sale.id+' finalizada! '+formatMoney(total),'success');
    openReceiptModal(sale);
  };

  // ===== PDV =====
  function renderPDV(m){
    var cats=[...new Set(DB.products.map(function(p){return p.cat}))];
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="shopping-cart" style="width:24px;height:24px;vertical-align:middle"></i> PDV — Ponto de Venda</h2></div>'+
      '<div class="pdv-layout">'+
      '<div>'+
      '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">'+
      '<input type="text" class="table-search" id="pdvSearch" placeholder="Buscar produto..." style="flex:1;min-width:200px">'+
      '<button class="btn btn-ghost pdv-cat-filter active" data-cat="Todos">Todos</button>'+
      cats.map(function(c){return '<button class="btn btn-ghost pdv-cat-filter" data-cat="'+c+'">'+c+'</button>'}).join('')+
      '</div>'+
      '<div class="pdv-products" id="pdvGrid"></div>'+
      '</div>'+
      '<div class="pdv-cart">'+
      '<div class="pdv-cart-head"><h3><i data-lucide="shopping-cart" style="width:16px;height:16px"></i> Carrinho</h3><div style="display:flex;gap:6px;align-items:center">'+
      '<span id="printerStatus" onclick="togglePrinterConnection()" style="cursor:pointer;font-size:11px;padding:4px 8px;border-radius:6px;background:'+(printerState.connected?'rgba(46,213,115,.15)':'rgba(255,71,87,.15)')+';color:'+(printerState.connected?'var(--success)':'var(--danger)')+'">'+(printerState.connected?'<i data-lucide="printer" style="width:12px;height:12px;vertical-align:middle;margin-right:2px"></i> Conectada':'<i data-lucide="plug" style="width:12px;height:12px;vertical-align:middle;margin-right:2px"></i> Impressora')+'</span>'+
      '<button class="btn btn-ghost" style="padding:6px 12px;font-size:12px" onclick="reprintLastSale()" title="Reimprimir ultimo cupom"><i data-lucide="printer" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Reimprimir</button><button class="btn btn-ghost" style="padding:6px 12px;font-size:12px" onclick="clearCart()">Limpar</button></div></div>'+
      '<div class="pdv-cart-body" id="pdvCartBody"><div class="pdv-empty">Adicione produtos clicando neles</div></div>'+
      '<div class="pdv-cart-foot">'+
      '<div class="pdv-total"><span class="pt-label">Total</span><span class="pt-value" id="pdvTotal">R$ 0,00</span></div>'+
      '<button class="pay-btn-avista" onclick="quickCashSale()">⚡ PAGAR À VISTA</button>'+
      '<div class="pdv-pay-btns">'+
      '<button class="pay-btn pay-dinheiro" onclick="confirmSale(\'dinheiro\')"><span class="pay-icon">💵</span> Dinheiro</button>'+
      '<button class="pay-btn pay-cartao" onclick="confirmSale(\'cartao\')"><span class="pay-icon">💳</span> Credito</button>'+
      '<button class="pay-btn pay-pix" onclick="confirmSale(\'pix\')"><span class="pay-icon">📱</span> PIX</button>'+
      '<button class="pay-btn pay-debito" onclick="confirmSale(\'debito\')"><span class="pay-icon">🏦</span> Debito</button>'+
      '</div>'+
      '<div class="barcode-section">'+
      '<div class="bc-label"><span class="bc-icon">📸</span> Leitor de Codigo de Barras</div>'+
      '<div class="barcode-input-wrap">'+
      '<input type="text" class="barcode-input" id="barcodeInput" placeholder="Escaneie, digite ID, nome ou codigo..." autocomplete="off" maxlength="50">'+
      '<button class="barcode-scan-btn" onclick="scanBarcode()">Ler</button>'+
      '<button class="barcode-scan-camera-btn" onclick="openBarcodeScanner(\'pdv\')" title="Escanear com a camera">📷 Camera</button>'+
      '</div>'+
      '<div class="barcode-last" id="barcodeStatus"></div>'+
      '</div>'+
      '</div></div></div></div>';
    renderPDVProducts('Todos');
    $('pdvSearch').addEventListener('input',function(){renderPDVProducts(getCurrentPdvCat())});
    document.querySelectorAll('.pdv-cat-filter').forEach(function(btn){
      btn.addEventListener('click',function(){
        document.querySelectorAll('.pdv-cat-filter').forEach(function(b){b.classList.remove('active')});
        btn.classList.add('active');
        renderPDVProducts(btn.dataset.cat);
      });
    });
    renderPdvCart();
    setTimeout(function(){
      if($('modalBg')&&$('modalBg').classList.contains('open'))return;
      var bcInput=$('barcodeInput');
      if(bcInput){
        bcInput.focus();
        bcInput.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();scanBarcode()}};
      }
    },400);
  }

  function getCurrentPdvCat(){
    var active=document.querySelector('.pdv-cat-filter.active');
    return active?active.dataset.cat:'Todos';
  }

  function refreshPDVPrices(){
    var grid=$('pdvGrid');
    if(grid)renderPDVProducts(getActivePdvCat());
    var cartBody=$('pdvCartBody');
    if(cartBody&&cartItems.length>0)renderPdvCart();
  }

  function renderPDVProducts(cat){
    var grid=$('pdvGrid');
    if(!grid)return;
    var search=($('pdvSearch')?$('pdvSearch').value:'').trim().toLowerCase();
    var items=DB.products.filter(function(p){
      if(p.stock<=0)return false;
      var exp=getExpiryStatus(p);
      if(exp&&exp.status==='expired')return false;
      if(cat!=='Todos'&&p.cat!==cat)return false;
      if(!search)return true;
      var nameMatch=p.name.toLowerCase().includes(search);
      var barcodeMatch=p.barcode?p.barcode.includes(search):false;
      var catMatch=p.cat.toLowerCase().includes(search);
      return nameMatch||barcodeMatch||catMatch;
    });
    grid.innerHTML=items.map(function(p){
      var hasPromo=p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price;
      var exp=getExpiryStatus(p);
      var priceDisplay=hasPromo?
        '<div class="pi-price" style="text-decoration:line-through;color:var(--txt2);font-size:11px">'+formatMoney(p.price)+'</div>'+
        '<div class="pi-price" style="color:#2ed573">'+formatMoney(p.promoPrice)+'</div>':
        '<div class="pi-price">'+formatMoney(p.price)+'</div>';
      var borderStyle='';
      if(exp&&(exp.status==='critical'||exp.status==='warning'))borderStyle='border-color:'+exp.color+';border-width:2px';
      var expBadge='';
      if(exp&&exp.status!=='ok')expBadge='<div style="font-size:9px;font-weight:700;color:'+exp.color+';margin-top:2px">'+exp.label+'</div>';
      var pdvStyle='';
      if(hasPromo)pdvStyle='border-color:rgba(46,213,115,.4)';
      if(borderStyle)pdvStyle=pdvStyle?pdvStyle+';'+borderStyle:borderStyle;
      return '<div class="pdv-item" onclick="addToCart('+p.id+')"'+(pdvStyle?' style="'+pdvStyle+'"':'')+'>'+
      '<div class="pi-icon">'+p.emoji+'</div>'+
      '<div class="pi-name">'+p.name+(isWeightProduct(p)?'<br><span style="font-size:9px;color:var(--accent);font-weight:700">⚖ PESO</span>':'')+'</div>'+
      priceDisplay+
      '<div class="pi-stock">Estoque: '+p.stock+'</div>'+
      expBadge+'</div>';
    }).join('');
    if(items.length===0)grid.innerHTML='<div class="empty-msg" style="grid-column:1/-1">Nenhum produto encontrado</div>';
  }

  window.addToCart=function(id){
    var prod=DB.products.find(function(p){return p.id===id});
    if(!prod||prod.stock<=0)return;
    if(isWeightProduct(prod)){openWeightModal(id);return}
    var exists=cartItems.find(function(c){return c.id===id});
    if(exists){
      if(exists.qty>=prod.stock){toast('Estoque insuficiente!','error');return}
      exists.qty++;
    }else{
      cartItems.push({id:id,qty:1});
    }
    renderPdvCart();
  };
  function cartStockError(){
    var bad=cartItems.find(function(c){
      var p=DB.products.find(function(x){return x.id===c.id});
      return !p||p.stock<c.qty;
    });
    if(!bad)return null;
    var p=DB.products.find(function(x){return x.id===bad.id});
    return p?p.name:('#'+bad.id);
  }
  window.removeFromCart=function(idx){
    cartItems.splice(idx,1);
    renderPdvCart();
  };
  window.changeCartQty=function(idx,delta){
    var item=cartItems[idx];
    var prod=DB.products.find(function(p){return p.id===item.id});
    if(isWeightProduct(prod)){
      var step=prod.unit==='kg'?0.1:100;
      item.qty=parseFloat((item.qty+delta*step).toFixed(3));
    }else{
      item.qty+=delta;
    }
    if(item.qty<=0)cartItems.splice(idx,1);
    else if(prod&&item.qty>prod.stock){item.qty=prod.stock;toast('Limite de estoque!','error')}
    renderPdvCart();
  };
  window.clearCart=function(){cartItems=[];renderPdvCart()};

  // ===== BARCODE SCANNER =====
  window.scanBarcode=function(){
    var input=$('barcodeInput');
    var status=$('barcodeStatus');
    if(!input||!status)return;
    var code=input.value.trim();
    if(!code){status.innerHTML='<span class="bc-notfound">Digite ou escaneie um codigo!</span>';input.focus();return}
    var prod=DB.products.find(function(p){return p.barcode===code});
    if(!prod){
      var numCode=parseInt(code);
      if(!isNaN(numCode)){
        prod=DB.products.find(function(p){return p.id===numCode});
      }
    }
    if(!prod){
      var searchLower=code.toLowerCase();
      prod=DB.products.find(function(p){return p.name.toLowerCase().includes(searchLower)});
    }
    if(!prod){
      status.innerHTML='<span class="bc-notfound">✕ Codigo nao encontrado: '+code+'</span>';
      input.value='';input.focus();
      toast('Produto nao encontrado!','error');
      return;
    }
    if(prod.stock<=0){
      status.innerHTML='<span class="bc-notfound">✕ '+prod.name+' — Sem estoque!</span>';
      input.value='';input.focus();
      toast('Produto sem estoque!','error');
      return;
    }
    if(isWeightProduct(prod)){
      status.innerHTML='<span class="bc-found">✓ '+prod.emoji+' '+prod.name+'</span> <span class="bc-added">⚖ Abrir balanca...</span>';
      input.value='';input.focus();
      openWeightModal(prod.id);
      return;
    }
    var exists=cartItems.find(function(c){return c.id===prod.id});
    if(exists){
      if(exists.qty>=prod.stock){
        status.innerHTML='<span class="bc-notfound">✕ '+prod.name+' — Estoque maximo atingido!</span>';
        input.value='';input.focus();
        return;
      }
      exists.qty++;
    }else{
      cartItems.push({id:prod.id,qty:1});
    }
    status.innerHTML='<span class="bc-found">✓ '+prod.emoji+' '+prod.name+'</span> <span class="bc-added">+1 adicionado ao carrinho</span>';
    input.value='';input.focus();
    renderPdvCart();
    toast(prod.emoji+' '+prod.name+' adicionado!','success');
  };
  window.renderPdvCart=function(){
    var body=$('pdvCartBody');
    if(!body)return;
    if(cartItems.length===0){body.innerHTML='<div class="pdv-empty">Adicione produtos clicando neles</div>';$('pdvTotal').textContent='R$ 0,00';return}
    var total=0;
    body.innerHTML=cartItems.map(function(c,i){
      var p=DB.products.find(function(x){return x.id===c.id});
      if(!p)return'';
      var isW=isWeightProduct(p);
      var unitPrice=(p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price)?p.promoPrice:p.price;
      var sub=isW?unitPrice*c.qty:unitPrice*c.qty;
      var unitLabel=isW?(p.unit||'kg'):'un';
      var qtyLabel=isW?c.qty.toFixed(p.unit==='kg'?3:0)+' '+unitLabel:'x'+c.qty;
      var priceLabel=isW?
        '<span style="font-size:11px;color:var(--txt2)">'+formatMoney(unitPrice)+'/'+unitLabel+'</span>':
        (p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price)?
          '<span style="font-size:11px;color:#2ed573">'+formatMoney(unitPrice)+' un ★</span>':
          '<span style="font-size:11px;color:var(--txt2)">'+formatMoney(p.price)+' un</span>';
      total+=sub;
      return '<div class="pdv-cart-item">'+
      '<span style="font-size:20px">'+p.emoji+'</span>'+
      '<div class="pci-name">'+p.name+(isW?'<span class="cart-weight-badge">⚖ PESO</span>':'')+'<br>'+priceLabel+'</div>'+
      '<div class="pci-qty"><button onclick="changeCartQty('+i+',-1)">−</button><span>'+qtyLabel+'</span><button onclick="changeCartQty('+i+',1)">+</button></div>'+
      '<span class="pci-price">'+formatMoney(sub)+'</span>'+
      '<button style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:14px" onclick="removeFromCart('+i+')">✕</button></div>';
    }).join('');
    $('pdvTotal').textContent=formatMoney(total);
  };

  window.quickCashSale=function(){
    if(cartItems.length===0){toast('Carrinho vazio!','error');return}
    cartItems=cartItems.filter(function(c){return DB.products.some(function(p){return p.id===c.id})});
    if(cartItems.length===0){toast('Carrinho vazio!','error');return}
    var total=cartItems.reduce(function(s,c){
      var p=DB.products.find(function(x){return x.id===c.id});
      var unitPrice=(p&&p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price)?p.promoPrice:p.price;
      return s+(p?unitPrice*c.qty:0);
    },0);
    var stockBad=cartStockError();
    if(stockBad){toast('Estoque insuficiente: '+stockBad,'error');return}
    var items=cartItems.map(function(c){
      var p=DB.products.find(function(x){return x.id===c.id});
      var unitPrice=(p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price)?p.promoPrice:p.price;
      return{productId:p.id,name:p.name,price:unitPrice,originalPrice:p.price,qty:c.qty,subtotal:unitPrice*c.qty,emoji:p.emoji,unit:isWeightProduct(p)?(p.unit||'kg'):'un',isWeight:isWeightProduct(p)};
    });
    var sale={
      id:genId('sale'),
      date:new Date().toISOString(),
      items:items,
      total:total,
      payment:'dinheiro',
      payments:[{method:'dinheiro',amount:total}],
      cashier:currentUser.name,
      clientId:currentUser.type==='cliente'?currentUser.id:null,
      status:'concluido'
    };
    items.forEach(function(it){
      var prod=DB.products.find(function(p){return p.id===it.productId});
      if(prod)prod.stock-=it.qty;
    });
    DB.sales.push(sale);
    saveDB();
    logActivity('VENDA','Venda #'+sale.id+' finalizada (à vista) — '+formatMoney(total)+' via dinheiro');
    cartItems=[];
    openReceiptModal(sale);
    renderPdvCart();
    renderPDVProducts(getCurrentPdvCat());
    toast('Venda #'+sale.id+' finalizada! '+formatMoney(total),'success');
  };

  var methodLabelsConfirm={dinheiro:'Dinheiro',cartao:'Credito',pix:'PIX',debito:'Debito'};
  var methodIcons={dinheiro:'💵',cartao:'💳',pix:'📱',debito:'🏦'};

  window.confirmSale=function(method){
    if(cartItems.length===0){toast('Carrinho vazio!','error');return}
    cartItems=cartItems.filter(function(c){return DB.products.some(function(p){return p.id===c.id})});
    if(cartItems.length===0){toast('Carrinho vazio!','error');return}
    var total=cartItems.reduce(function(s,c){
      var p=DB.products.find(function(x){return x.id===c.id});
      var unitPrice=(p&&p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price)?p.promoPrice:p.price;
      return s+(p?unitPrice*c.qty:0);
    },0);
    var itemsHTML=cartItems.map(function(c){
      var p=DB.products.find(function(x){return x.id===c.id});
      if(!p)return'';
      var unitPrice=(p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price)?p.promoPrice:p.price;
      return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px">'+
        '<span>'+p.name+' '+(isWeightProduct(p)?c.qty+' '+(p.unit||'kg'):(c.qty===1?'x1':'x'+c.qty))+'</span>'+
        '<span style="font-weight:700">'+formatMoney(unitPrice*c.qty)+'</span></div>';
    }).join('');
    var methods=[
      {id:'dinheiro',icon:'💵',label:'Dinheiro',color:'#2ed573'},
      {id:'debito',icon:'🏦',label:'Debito',color:'#6e9bff'},
      {id:'pix',icon:'📱',label:'PIX',color:'#a855f7'},
      {id:'cartao',icon:'💳',label:'Credito',color:'#f39c12'}
    ];
    var splitRows=methods.map(function(m){
      return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">'+
        '<span style="font-size:18px;width:30px;text-align:center">'+m.icon+'</span>'+
        '<span style="flex:1;font-weight:600;font-size:14px">'+m.label+'</span>'+
        '<input type="number" class="split-input" data-method="'+m.id+'" min="0" step="0.01" value="0" placeholder="0,00" '+
        'style="width:120px;padding:8px 12px;border-radius:var(--r);border:1px solid var(--border);background:var(--bg3);color:var(--txt);font-size:14px;text-align:right;font-weight:700"'+
        ' oninput="updateSplitTotals()">'+
        '</div>';
    }).join('');
    var body=
      '<div style="text-align:center;margin-bottom:16px">'+
      '<div style="font-size:14px;color:var(--txt2);margin-bottom:4px">Total a pagar</div>'+
      '<div style="font-size:32px;font-weight:900;color:var(--accent)" id="splitTotalDisplay">'+formatMoney(total)+'</div>'+
      '<div id="splitRemain" style="margin-top:6px;font-size:13px;font-weight:700;color:var(--txt2)">Restante: '+formatMoney(total)+'</div></div>'+
      '<div style="max-height:180px;overflow-y:auto;margin-bottom:12px">'+itemsHTML+'</div>'+
      '<div style="margin-top:12px">'+
      '<div style="font-size:13px;font-weight:700;color:var(--txt2);margin-bottom:8px"><i data-lucide="split" style="width:16px;height:16px;vertical-align:middle"></i> Dividir Pagamento (preencha os campos desejados):</div>'+
      splitRows+'</div>'+
      '<div style="margin-top:12px;display:flex;gap:8px">'+
      '<button class="btn btn-ghost" style="flex:1" onclick="quickSplit(\''+method+'\','+total+')">Preencher 100% '+methodIcons[method]+'</button>'+
      '<button class="btn btn-ghost" style="flex:1" onclick="clearSplitInputs()">Limpar</button></div>'+
      '<div style="margin-top:10px;padding:8px;background:var(--bg3);border-radius:var(--r);font-size:11px;color:var(--txt2);text-align:center">💡 Preencha qualquer campo. Campos em zero serao ignorados. O total deve ser exatamente o valor da venda.</div>';
    window._splitSaleTotal=total;
    var foot=
      '<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>'+
      '<button class="btn btn-primary" id="confirmSplitBtn" style="padding:14px 32px;font-size:15px" onclick="finishSplitSale()">✔ Confirmar Venda</button>';
    openModal('Pagamento — Venda',body,foot,'modal-split-payment');
    setTimeout(updateSplitTotals,100);
  };

  window.quickSplit=function(method,total){
    document.querySelectorAll('.split-input').forEach(function(inp){inp.value='0'});
    var inp=document.querySelector('.split-input[data-method="'+method+'"]');
    if(inp){inp.value=total.toFixed(2);inp.focus()}
    updateSplitTotals();
  };

  window.clearSplitInputs=function(){
    document.querySelectorAll('.split-input').forEach(function(inp){inp.value='0'});
    updateSplitTotals();
  };

  window.updateSplitTotals=function(){
    var total=window._splitSaleTotal||0;
    var sum=0;
    document.querySelectorAll('.split-input').forEach(function(inp){
      sum+=parseFloat(inp.value)||0;
    });
    var remain=total-sum;
    var remainEl=document.getElementById('splitRemain');
    var btn=document.getElementById('confirmSplitBtn');
    if(remainEl){
      if(Math.abs(remain)<0.01){
        remainEl.textContent='✓ Pagamento completo!';
        remainEl.style.color='var(--success)';
      }else if(remain>0){
        remainEl.textContent='Restante: '+formatMoney(remain);
        remainEl.style.color='var(--warn)';
      }else{
        remainEl.textContent='Excedido: '+formatMoney(Math.abs(remain));
        remainEl.style.color='var(--danger)';
      }
    }
    if(btn){
      btn.disabled=Math.abs(remain)>0.01;
      btn.style.opacity=Math.abs(remain)>0.01?'0.5':'1';
    }
  };

  window.finishSplitSale=function(){
    if(cartItems.length===0){toast('Carrinho vazio!','error');return}
    cartItems=cartItems.filter(function(c){return DB.products.some(function(p){return p.id===c.id})});
    if(cartItems.length===0){toast('Carrinho vazio!','error');return}
    var total=cartItems.reduce(function(s,c){
      var p=DB.products.find(function(x){return x.id===c.id});
      var unitPrice=(p&&p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price)?p.promoPrice:p.price;
      return s+(p?unitPrice*c.qty:0);
    },0);
    var payments=[];
    var sum=0;
    document.querySelectorAll('.split-input').forEach(function(inp){
      var val=parseFloat(inp.value)||0;
      if(val>0){
        payments.push({method:inp.dataset.method,amount:val});
        sum+=val;
      }
    });
    if(payments.length===0){toast('Informe pelo menos uma forma de pagamento!','error');return}
    if(Math.abs(sum-total)>0.01){toast('O total dos pagamentos deve ser igual ao valor da venda!','error');return}
    var stockBad=cartStockError();
    if(stockBad){toast('Estoque insuficiente: '+stockBad,'error');return}
    var items=cartItems.map(function(c){
      var p=DB.products.find(function(x){return x.id===c.id});
      var unitPrice=(p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price)?p.promoPrice:p.price;
      return{productId:p.id,name:p.name,price:unitPrice,originalPrice:p.price,qty:c.qty,subtotal:unitPrice*c.qty,emoji:p.emoji,unit:isWeightProduct(p)?(p.unit||'kg'):'un',isWeight:isWeightProduct(p)};
    });
    var primaryMethod=payments.length===1?payments[0].method:'dividido';
    var sale={
      id:genId('sale'),
      date:new Date().toISOString(),
      items:items,
      total:total,
      payment:primaryMethod,
      payments:payments,
      cashier:currentUser.name,
      clientId:currentUser.type==='cliente'?currentUser.id:null,
      status:'concluido'
    };
    items.forEach(function(it){
      var prod=DB.products.find(function(p){return p.id===it.productId});
      if(prod)prod.stock-=it.qty;
    });
    DB.sales.push(sale);
    saveDB();
    var payDesc=payments.map(function(p){return methodIcons[p.method]+' '+formatMoney(p.amount)}).join(' + ');
    logActivity('VENDA','Venda #'+sale.id+' finalizada — '+formatMoney(total)+' via '+payDesc);
    cartItems=[];
    openReceiptModal(sale);
    renderPdvCart();
    renderPDVProducts(getCurrentPdvCat());
    toast('Venda #'+sale.id+' finalizada! '+formatMoney(total),'success');
  };

  function openReceiptModal(sale){
    var methodLabels={dinheiro:'Dinheiro',cartao:'Credito',pix:'PIX',debito:'Debito'};
    var methodIcons={dinheiro:'💵',cartao:'💳',pix:'📱',debito:'🏦'};
    var itemsHTML=sale.items.map(function(it){
      var hasPromo=it.originalPrice&&it.originalPrice>it.price;
      var qtyText=it.isWeight?it.qty.toFixed(3)+' '+(it.unit||'kg'):'x'+it.qty;
      var itemLine='<div class="r-item"><span>'+it.name+' '+qtyText+'</span><span>'+formatMoney(it.subtotal)+'</span></div>';
      if(hasPromo){
        itemLine='<div class="r-item"><span>'+it.name+' '+qtyText+'</span><span>'+formatMoney(it.subtotal)+'</span></div>'+
          '<div class="r-subtotal">( De '+formatMoney(it.originalPrice)+' )</div>';
      }
      return itemLine;
    }).join('');
    var paymentHTML='';
    if(sale.payments&&sale.payments.length>1){
      paymentHTML=sale.payments.map(function(p){
        return '<div class="r-item"><span>'+methodIcons[p.method]+' '+methodLabels[p.method]+'</span><span>'+formatMoney(p.amount)+'</span></div>';
      }).join('');
    }else{
      paymentHTML='<div class="r-item"><span>Pagamento:</span><span>'+(methodLabels[sale.payment]||sale.payment)+'</span></div>';
    }
    var co=getCompanyData();
    var companyName=co?(co.fantasyName||co.name||'Empresa'):'PETSHOP PRADO';
    var companyCnpj=co?(co.cnpj||co.cpf||''):'';
    var companyAddr=co?(co.address+(co.number?', '+co.number:'')+(co.neighborhood?' — '+co.neighborhood:'')+(co.city?' — '+co.city+'/'+(co.state||''):'')):'';
    var companyPhone=co?(co.phone||''):'';
    var companyMotto=co?(co.motto||''):'';
    var companyEmail=co?(co.email||''):'';
    var companyLogo=co?(co.logo||''):'';
    var html='<div class="receipt" id="receiptContent">'+
      '<div class="r-header">'+(companyLogo?'<img src="'+companyLogo+'" style="max-height:40px;margin-bottom:4px"><br>':'')+
      '<h3>'+companyName+'</h3>'+
      (companyMotto?'<p style="font-style:italic">'+companyMotto+'</p>':'')+
      (companyCnpj?'<p>CNPJ: '+companyCnpj+'</p>':'')+
      (companyAddr?'<p>'+companyAddr+'</p>':'')+
      (companyPhone?'<p>'+companyPhone+'</p>':'')+
      '<p>'+formatDate(sale.date)+'</p>'+
      '<p>Cupom Nao Fiscal</p></div>'+
      '<hr class="r-divider">'+
      '<div style="font-size:11px;color:#333;margin-bottom:8px"><strong>Venda #'+sale.id+'</strong></div>'+
      '<div>'+itemsHTML+'</div>'+
      '<hr class="r-divider">'+
      '<div class="r-total"><span>TOTAL</span><span>'+formatMoney(sale.total)+'</span></div>'+
      '<hr class="r-divider">'+
      paymentHTML+
      '<div class="r-item"><span>Atendente:</span><span>'+sale.cashier+'</span></div>'+
      '<hr class="r-divider">'+
      '<div class="r-footer">Obrigado pela preferencia!<br>'+companyName+(companyEmail?'<br>'+companyEmail:'')+'</div></div>';
    openModal('Cupom Fiscal #'+sale.id,html,
      '<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">'+
      '<button class="btn btn-ghost" onclick="togglePrinterConnection()" id="printerToggleBtn" style="font-size:11px">'+(printerState.connected?'<i data-lucide="printer" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Desconectar':'<i data-lucide="plug" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Conectar Impressora')+'</button>'+
      '<button class="btn btn-primary" onclick="printDirectFromModal()" style="background:var(--success);font-size:11px"><i data-lucide="printer" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Imprimir Direto</button>'+
      '<button class="btn btn-ghost" onclick="printPDVReceipt()" style="font-size:11px"><i data-lucide="printer" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Via Windows</button>'+
      '<button class="btn btn-primary" onclick="closeModal()" style="font-size:11px">Fechar</button>'+
      '</div>',
      'modal-receipt');
  }

  window.printReceipt=function(){
    var content=$('receiptContent');
    if(!content)return;
    smartPrint(content.innerHTML,{title:'Cupom',width:70,fontSize:11});
  };

  window.printPDVReceipt=function(){
    var content=$('receiptContent');
    if(!content)return;
    var co=getCompanyData();
    var companyName=co?(co.fantasyName||co.name||'Empresa'):'PETSHOP PRADO';
    var companyCnpj=co?(co.cnpj||co.cpf||''):'';
    var companyAddr=co?(co.address+(co.number?', '+co.number:'')+(co.neighborhood?' — '+co.neighborhood:'')+(co.city?' — '+co.city+'/'+(co.state||''):'')):'';
    var companyPhone=co?(co.phone||''):'';
    var companyMotto=co?(co.motto||''):'';

    var saleId='';
    var saleTotal='';
    var saleItems='';
    var salePayment='';
    var saleCashier='';
    var saleDate='';

    var items=content.querySelectorAll('.r-item');
    var totalEl=content.querySelector('.r-total');
    var headerEl=content.querySelector('.r-header');

    if(headerEl){
      var ps=headerEl.querySelectorAll('p');
      if(ps.length>0)saleDate=ps[ps.length-2]?ps[ps.length-2].textContent:'';
    }
    if(totalEl) saleTotal=totalEl.querySelector('span:last-child')?totalEl.querySelector('span:last-child').textContent:'';

    var allItems=[];
    items.forEach(function(el){
      var spans=el.querySelectorAll('span');
      if(spans.length>=2){
        var left=spans[0].textContent.trim();
        var right=spans[1].textContent.trim();
        if(left.indexOf('Atendente:')!==-1){
          saleCashier=right;
        }else if(left.indexOf('Pagamento:')===-1&&left.indexOf('Dinheiro')===-1&&left.indexOf('Credito')===-1&&left.indexOf('PIX')===-1&&left.indexOf('Debito')===-1){
          allItems.push(left+'  '+right);
        }else{
          salePayment+=left+' '+right+'\n';
        }
      }
    });

    var titleEl=content.querySelector('strong');
    if(titleEl){
      var t=titleEl.textContent.trim();
      if(t.indexOf('Venda #')!==-1)saleId=t.replace('Venda #','');
    }

    var lines=[];
    var c='========================================\n';
    var cl='----------------------------------------\n';
    var center=function(s){var pad=Math.floor((42-s.length)/2);var left='';for(var i=0;i<pad;i++)left+=' ';return left+s};

    lines.push(center(companyName));
    if(companyMotto) lines.push(center(companyMotto));
    if(companyCnpj) lines.push(center('CNPJ: '+companyCnpj));
    if(companyAddr) lines.push(center(companyAddr));
    if(companyPhone) lines.push(center(companyPhone));
    lines.push(c);
    if(saleDate) lines.push('  Data: '+saleDate);
    if(saleId) lines.push('  Venda: #'+saleId);
    lines.push(c);
    lines.push('  PRODUTO                QTD    VALOR');
    lines.push(cl);

    allItems.forEach(function(item){
      var parts=item.split(/\s{2,}/);
      if(parts.length>=2){
        var name=parts[0];
        var val=parts[parts.length-1];
        if(name.length>20) name=name.substring(0,20);
        var qtyPart=item.replace(name,'').replace(val,'').trim();
        var line='  '+name;
        while(line.length<26) line+=' ';
        line+=qtyPart;
        while(line.length<35) line+=' ';
        line+=val;
        lines.push(line);
      }else{
        lines.push('  '+item);
      }
    });

    lines.push(cl);
    lines.push(center('TOTAL: '+saleTotal));
    lines.push(cl);
    if(salePayment) lines.push('  '+salePayment.trim());
    lines.push('  Atendente: '+(saleCashier||''));
    lines.push(c);
    lines.push(center('Obrigado pela preferencia!'));
    lines.push(center(companyName));
    lines.push('\n\n\n');

    var printText=lines.join('\n');
    smartPrint(printText,{title:'PDV',width:70,fontSize:11});
  };

  // ===== IMPRESSAO DIRETA (ESC/POS - Sem dialogo do Windows) =====
  var printerState={connected:false,port:null,reader:null,writer:null,baudRate:9600};

  function getPrinterCfg(){
    if(!DB.settings)DB.settings={};
    if(!DB.settings.printer)DB.settings.printer={baudRate:9600};
    return DB.settings.printer;
  }

  window.printerConnect=async function(){
    if(!navigator.serial){
      toast('Seu navegador nao suporta Web Serial API. Use Chrome ou Edge.','error');
      return false;
    }
    try{
      var cfg=getPrinterCfg();
      printerState.baudRate=cfg.baudRate||9600;
      var ports=await navigator.serial.getPorts();
      var port=null;
      if(ports.length>0){
        port=ports[0];
      }else{
        try{
          port=await navigator.serial.requestPort();
        }catch(e){
          if(e.name==='NotFoundError'){
            toast('Nenhuma impressora selecionada.','info');
            return false;
          }
          throw e;
        }
      }
      try{
        await port.open({baudRate:printerState.baudRate});
      }catch(e){
        if(e.message&&e.message.includes('already open')){
          toast('Porta ja esta em uso. Tentando reconectar...','info');
          await port.close();
          await new Promise(function(r){setTimeout(r,500)});
          await port.open({baudRate:printerState.baudRate});
        }else{
          throw e;
        }
      }
      printerState.port=port;
      printerState.connected=true;
      printerState.writer=port.writable.getWriter();
      toast('Impressora conectada!','success');
      logActivity('PRINTER_CONNECT','Impressora ESC/POS conectada — baud: '+printerState.baudRate);
      updatePrinterStatusUI();
      return true;
    }catch(e){
      var msg='Erro ao conectar impressora';
      if(e.name==='NotFoundError'){
        msg='Nenhuma impressora encontrada';
      }else if(e.name==='SecurityError'){
        msg='Acesso negado. Use HTTPS ou localhost';
      }else if(e.message){
        msg+=': '+e.message;
      }
      toast(msg,'error');
      return false;
    }
  };

  window.printerDisconnect=async function(){
    if(printerState.writer){
      try{printerState.writer.releaseLock();}catch(e){}
      printerState.writer=null;
    }
    if(printerState.port){
      try{await printerState.port.close();}catch(e){}
      printerState.port=null;
    }
    printerState.connected=false;
    toast('Impressora desconectada','info');
    updatePrinterStatusUI();
    // Atualizar status na tela de configuracoes se aberta
    var prStatus=document.getElementById('prStatus');
    if(prStatus){
      prStatus.innerHTML='Status: <span style="color:var(--danger)"><span style="color:var(--danger)">&#x25cf;</span> Desconectada</span>';
    }
  };

  function updatePrinterStatusUI(){
    var npCfg=getNetworkPrinterCfg();
    var npEnabled=npCfg&&npCfg.enabled;
    var el=document.getElementById('printerStatus');
    if(el){
      if(printerState.connected){
        el.style.background='rgba(46,213,115,.15)';
        el.style.color='var(--success)';
        el.innerHTML='<i data-lucide="printer" style="width:12px;height:12px;vertical-align:middle;margin-right:2px"></i> Conectada';
      }else if(npEnabled){
        el.style.background='rgba(168,85,247,.15)';
        el.style.color='#a855f7';
        el.textContent='🌐 Rede';
      }else{
        el.style.background='rgba(255,71,87,.15)';
        el.style.color='var(--danger)';
        el.innerHTML='<i data-lucide="plug" style="width:12px;height:12px;vertical-align:middle;margin-right:2px"></i> Impressora';
      }
    }
    // Atualizar status na tela de configuracoes se aberta
    var prStatus=document.getElementById('prStatus');
    if(prStatus){
      prStatus.innerHTML='Status: '+(printerState.connected?'<span style="color:var(--success)"><span style="color:var(--success)">●</span> Conectada</span>':'<span style="color:var(--danger)"><span style="color:var(--danger)">●</span> Desconectada</span>')+
      (printerState.connected?' — Baud: '+printerState.baudRate:'');
    }
    // Atualizar status da impressora de rede na tela de configuracoes
    var npStatus=document.getElementById('npStatus');
    if(npStatus){
      npStatus.innerHTML='Status: '+(npEnabled?'<span style="color:var(--success)"><span style="color:var(--success)">●</span> Ativada</span>':'<span style="color:var(--danger)"><span style="color:var(--danger)">●</span> Desativada</span>')+
      (npEnabled?' — '+(npCfg.type==='ip'?npCfg.ip+':'+npCfg.port:npCfg.name):'');
    }
  }

  // ===== FUNCAO UNIFICADA DE IMPRESSAO =====
  // Imprime via impressora configurada: Rede > ESC/POS > Dialogo Windows
  window.smartPrint=function(content,opts){
    opts=opts||{};
    var title=opts.title||'Cupom';
    var width=opts.width||70;
    var fontSize=opts.fontSize||11;

    // 1. Se impressora de rede configurada e ativada, imprime via servidor
    var npCfg=getNetworkPrinterCfg();
    if(npCfg&&npCfg.enabled){
      var printerName=npCfg.type==='ip'?npCfg.ip:npCfg.name;
      if(printerName){
        // Clean HTML tags for printing
        var printContent=content.replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>');

        fetch('/api/network-print',{
          method:'POST',
          headers:{'Content-Type':'application/json','x-auth-token':getAuthToken()},
          body:JSON.stringify({
            content:printContent,
            printerName:printerName,
            printerType:npCfg.type||'shared',
            printerPort:npCfg.port||9100
          })
        }).then(function(r){return r.json()}).then(function(data){
          if(data.ok){
            toast('Impresso na impressora de rede!','success');
            logActivity('PRINTER_PRINT_REDE','Impressao via rede — '+printerName);
          }else{
            console.error('[PRINT] Erro impressao rede:',data.error);
            toast('Erro na impressora de rede, tentando outra via...','info');
            // Fallback to ESC/POS
            if(printerState.connected&&printerState.writer){
              try{var lines;if(content.indexOf('<')!==-1){lines=getReceiptLines(content)}else{lines=content.split('\n').filter(function(l){return l.length>0}).map(function(l){return{text:l}})}printDirect(lines);toast('Impresso na impressora!','success');return true;}catch(e){console.error('[PRINT] Erro ESC/POS:',e)}
            }
            // Fallback to Windows dialog
            var win=window.open('','','width=400,height=700');win.document.write('<html><head><title>'+title+'</title><style>@page{size:'+width+'mm auto;margin:0}body{margin:0;padding:4mm 2mm;font-family:Courier New,monospace;font-size:'+fontSize+'px;line-height:1.4;color:#000;background:#fff;white-space:pre-wrap;word-wrap:break-word}</style></head><body>'+content+'</body></html>');win.document.close();win.focus();setTimeout(function(){win.print();win.close()},300);return true;
          }
        }).catch(function(e){
          console.error('[PRINT] Erro na rede:',e);
          toast('Erro ao conectar com a impressora de rede','error');
        });
        return true;
      }
    }

    // 2. Se impressora ESC/POS conectada, imprime direto
    if(printerState.connected&&printerState.writer){
      try{
        var lines;
        if(content.indexOf('<')!==-1){
          lines=getReceiptLines(content);
        }else{
          lines=content.split('\n').filter(function(l){return l.length>0}).map(function(l){return{text:l}});
        }
        printDirect(lines);
        toast('Impresso na impressora!','success');
        return true;
      }catch(e){
        console.error('[PRINT] Erro na impressao direta:',e);
        toast('Erro na impressora, usando impressao do sistema','info');
      }
    }

    // 3. Fallback: abre dialogo do Windows
    var win=window.open('','','width=400,height=700');
    win.document.write('<html><head><title>'+title+'</title><style>'+
      '@page{size:'+width+'mm auto;margin:0}'+
      'body{margin:0;padding:4mm 2mm;font-family:Courier New,monospace;font-size:'+fontSize+'px;line-height:1.4;color:#000;background:#fff;white-space:pre-wrap;word-wrap:break-word}'+
      '.r-header{text-align:center;border-bottom:1px dashed #000;padding-bottom:6px;margin-bottom:6px}'+
      '.r-header h3{font-size:13px;margin:0 0 2px 0}'+
      '.r-header p{font-size:9px;margin:1px 0;color:#333}'+
      '.r-item{display:flex;justify-content:space-between;padding:2px 0;font-size:10px}'+
      '.r-item span:first-child{flex:1}'+
      '.r-item span:last-child{text-align:right;font-weight:600}'+
      '.r-total{border-top:1px dashed #000;margin-top:6px;padding-top:6px;font-weight:900;font-size:12px;display:flex;justify-content:space-between}'+
      '.r-footer{text-align:center;margin-top:8px;font-size:8px;color:#555}'+
      '.r-divider{border:none;border-top:1px dashed #ccc;margin:4px 0}'+
      '.r-subtotal{text-align:right;font-size:9px;color:#555}'+
      '</style></head><body>'+
      content+
      '</body></html>');
    win.document.close();
    win.focus();
    setTimeout(function(){win.print();win.close()},300);
    return true;
  };

  function escposText(text){
    return new TextEncoder().encode(text);
  }

  function escposCommand(cmd){
    var arr=[];
    for(var i=0;i<cmd.length;i++){
      if(typeof cmd[i]==='string'){
        arr.push(parseInt(cmd[i],16));
      }else{
        arr.push(cmd[i]);
      }
    }
    return new Uint8Array(arr);
  }

  async function printDirect(lines){
    if(!printerState.connected||!printerState.writer){
      toast('Impressora nao conectada! Conecte primeiro.','error');
      return false;
    }
    try{
      var center=escposCommand(['1B','61','01']); // ESC a 1 (center)
      var left=escposCommand(['1B','61','00']);   // ESC a 0 (left)
      var boldOn=escposCommand(['1B','45','01']); // ESC E 1
      var boldOff=escposCommand(['1B','45','00']); // ESC E 0
      var doubleHeight=escposCommand(['1B','21','10']); // ESC ! 16
      var doubleWidth=escposCommand(['1B','21','20']); // ESC ! 32
      var doubleBoth=escposCommand(['1B','21','30']); // ESC ! 48
      var normal=escposCommand(['1B','21','00']); // ESC ! 0
      var cut=escposCommand(['1D','56','42']); // GS V B (partial cut)
      var feed=escposCommand(['1B','64','03']); // ESC d 3 (feed 3 lines)
      var lineDash=escposCommand(['1B','6A','02']); // ESC j 2 (draw line)

      for(var i=0;i<lines.length;i++){
        var line=lines[i];
        if(line===null){
          // Separator line
          await printerState.writer.write(lineDash);
        }else if(line.center){
          await printerState.writer.write(center);
          if(line.bold&&line.double){
            await printerState.writer.write(doubleBoth);
            await printerState.writer.write(boldOn);
          }else if(line.double){
            await printerState.writer.write(doubleBoth);
          }else if(line.bold){
            await printerState.writer.write(boldOn);
          }
          await printerState.writer.write(escposText(line.text));
          await printerState.writer.write(normal);
          await printerState.writer.write(boldOff);
          await printerState.writer.write(left);
        }else{
          await printerState.writer.write(left);
          if(line.bold){
            await printerState.writer.write(boldOn);
          }
          if(line.double){
            await printerState.writer.write(doubleBoth);
          }
          await printerState.writer.write(escposText(line.text));
          if(line.bold){
            await printerState.writer.write(boldOff);
          }
          if(line.double){
            await printerState.writer.write(normal);
          }
        }
        await printerState.writer.write(escposText('\n'));
      }

      await printerState.writer.write(feed);
      await printerState.writer.write(cut);

      logActivity('PRINTER_PRINT','Cupom impresso via ESC/POS');
      return true;
    }catch(e){
      toast('Erro na impressao: '+e.message,'error');
      toast('Tente reconectar a impressora','info');
      printerState.connected=false;
      return false;
    }
  }

  function getReceiptLines(receiptHTML){
    var lines=[];
    var temp=document.createElement('div');
    temp.innerHTML=receiptHTML;

    var items=temp.querySelectorAll('.r-item');

    // Header
    var h3=temp.querySelector('.r-header h3');
    if(h3)lines.push({text:h3.textContent.trim(),center:true,bold:true,double:true});
    var ps=temp.querySelectorAll('.r-header p');
    for(var i=0;i<ps.length;i++){
      lines.push({text:ps[i].textContent.trim(),center:true});
    }
    lines.push(null);

    // Items
    for(var i=0;i<items.length;i++){
      var spans=items[i].querySelectorAll('span');
      if(spans.length>=2){
        var left=spans[0].textContent.trim();
        var right=spans[1].textContent.trim();
        var padLen=38;
        var leftText=left;
        while(leftText.length<padLen)leftText+=' ';
        leftText+=right;
        lines.push({text:leftText});
      }
    }

    // Total
    var totalEl=temp.querySelector('.r-total');
    if(totalEl){
      var tSpans=totalEl.querySelectorAll('span');
      if(tSpans.length>=2){
        var tLeft=tSpans[0].textContent.trim();
        var tRight=tSpans[1].textContent.trim();
        var tPad=38;
        var tText=tLeft;
        while(tText.length<tPad)tText+=' ';
        tText+=tRight;
        lines.push(null);
        lines.push({text:tText,bold:true});
      }
    }

    // Footer
    var footerEl=temp.querySelector('.r-footer');
    if(footerEl){
      var footerLines=footerEl.innerHTML.split(/<br\s*\/?>/i);
      lines.push(null);
      for(var f=0;f<footerLines.length;f++){
        var tDiv=document.createElement('div');
        tDiv.innerHTML=footerLines[f];
        var t=tDiv.textContent.trim();
        if(t)lines.push({text:t,center:true});
      }
    }
    lines.push(null);

    return lines;
  }

  window.printDirectSale=function(receiptHTML){
    var lines=getReceiptLines(receiptHTML);
    if(printerState.connected){
      printDirect(lines);
    }else{
      toast('Conecte a impressora para impressao direta!','info');
      toast('Clique no botao de conectar impressora','info');
    }
  };

  // Botao de conectar impressora
  window.togglePrinterConnection=function(){
    if(printerState.connected){
      printerDisconnect();
    }else{
      printerConnect();
    }
  };

  window.printDirectFromModal=function(){
    var content=$('receiptContent');
    if(!content){toast('Cupom nao encontrado!','error');return}
    var receiptHTML=content.innerHTML;
    // Usa smartPrint para suportar impressora de rede + ESC/POS + Windows
    smartPrint(receiptHTML,{title:'PDV',width:70,fontSize:11});
  };

  function generateReceiptHTML(sale){
    var methodLabels={dinheiro:'Dinheiro',cartao:'Credito',pix:'PIX',debito:'Debito'};
    var methodIcons={dinheiro:'💵',cartao:'💳',pix:'📱',debito:'🏦'};
    var itemsHTML=sale.items.map(function(it){
      var hasPromo=it.originalPrice&&it.originalPrice>it.price;
      var qtyText=it.isWeight?it.qty.toFixed(3)+' '+(it.unit||'kg'):'x'+it.qty;
      var itemLine='<div class="r-item"><span>'+it.name+' '+qtyText+'</span><span>'+formatMoney(it.subtotal)+'</span></div>';
      if(hasPromo){
        itemLine='<div class="r-item"><span>'+it.name+' '+qtyText+'</span><span>'+formatMoney(it.subtotal)+'</span></div>'+
          '<div class="r-subtotal">( De '+formatMoney(it.originalPrice)+' )</div>';
      }
      return itemLine;
    }).join('');
    var paymentHTML='';
    if(sale.payments&&sale.payments.length>1){
      paymentHTML=sale.payments.map(function(p){
        return '<div class="r-item"><span>'+methodIcons[p.method]+' '+methodLabels[p.method]+'</span><span>'+formatMoney(p.amount)+'</span></div>';
      }).join('');
    }else{
      paymentHTML='<div class="r-item"><span>Pagamento:</span><span>'+(methodLabels[sale.payment]||sale.payment)+'</span></div>';
    }
    var co=getCompanyData();
    var companyName=co?(co.fantasyName||co.name||'Empresa'):'PETSHOP PRADO';
    var companyCnpj=co?(co.cnpj||co.cpf||''):'';
    var companyAddr=co?(co.address+(co.number?', '+co.number:'')+(co.neighborhood?' — '+co.neighborhood:'')+(co.city?' — '+co.city+'/'+(co.state||''):'')):'';
    var companyPhone=co?(co.phone||''):'';
    var companyMotto=co?(co.motto||''):'';
    var companyEmail=co?(co.email||''):'';
    var companyLogo=co?(co.logo||''):'';
    return '<div class="r-header">'+(companyLogo?'<img src="'+companyLogo+'" style="max-height:40px;margin-bottom:4px"><br>':'')+
      '<h3>'+companyName+'</h3>'+
      (companyMotto?'<p style="font-style:italic">'+companyMotto+'</p>':'')+
      (companyCnpj?'<p>CNPJ: '+companyCnpj+'</p>':'')+
      (companyAddr?'<p>'+companyAddr+'</p>':'')+
      (companyPhone?'<p>'+companyPhone+'</p>':'')+
      '<p>'+formatDate(sale.date)+'</p>'+
      '<p>Cupom Nao Fiscal</p></div>'+
      '<hr class="r-divider">'+
      '<div style="font-size:11px;color:#333;margin-bottom:8px"><strong>Venda #'+sale.id+'</strong></div>'+
      '<div>'+itemsHTML+'</div>'+
      '<hr class="r-divider">'+
      '<div class="r-total"><span>TOTAL</span><span>'+formatMoney(sale.total)+'</span></div>'+
      '<hr class="r-divider">'+
      paymentHTML+
      '<div class="r-item"><span>Atendente:</span><span>'+sale.cashier+'</span></div>'+
      '<hr class="r-divider">'+
      '<div class="r-footer">Obrigado pela preferencia!<br>'+companyName+(companyEmail?'<br>'+companyEmail:'')+'</div>';
  }

  window.reprintLastSale=function(){
    var sales=DB.sales||[];
    if(sales.length===0){toast('Nenhuma venda registrada!','error');return}
    var lastSale=sales[sales.length-1];
    var receiptHTML=generateReceiptHTML(lastSale);
    smartPrint(receiptHTML,{title:'Reimpressao',width:70,fontSize:11});
  };

  // ===== PRODUCTS =====
  function renderProducts(m){
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="package" style="width:24px;height:24px;vertical-align:middle"></i> Produtos</h2><div class="header-actions">'+
      ((DB.settings.userPermissions&&DB.settings.userPermissions[currentUser.type]&&DB.settings.userPermissions[currentUser.type].bulkpriceincrease!==false)?'<button class="btn btn-ghost" onclick="openBulkPriceIncrease()"><i data-lucide="trending-up" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Aumentar Preco (%)</button>':'')+
      '<button class="btn btn-primary" onclick="openProductModal()">+ Novo Produto</button>'+
      '</div></div>'+
      '<div class="table-wrap"><div class="table-header"><h3>'+DB.products.length+' produtos</h3>'+
      '<input type="text" class="table-search" id="prodSearch" placeholder="Buscar produto..."></div>'+
      '<table><thead><tr><th></th><th>Nome</th><th>Categoria</th><th>Preco</th><th>Estoque</th><th>Validade / Lote</th><th>Acoes</th></tr></thead>'+
      '<tbody id="prodTableBody"></tbody></table></div>';
    renderProductTable();
    $('prodSearch').addEventListener('input',renderProductTable);
  }
  function renderProductTable(){
    var search=($('prodSearch')?$('prodSearch').value:'').trim().toLowerCase();
    var items=DB.products.filter(function(p){return p.name.toLowerCase().includes(search)||(p.barcode&&p.barcode.includes(search))||p.cat.toLowerCase().includes(search)});
    var html=items.map(function(p){
      var stockClass=p.stock<=p.minStock?'b-red':p.stock<=p.minStock*2?'b-yellow':'b-green';
      var stockLabel=p.stock<=p.minStock?'BAIXO':p.stock<=p.minStock*2?'MEDIO':'OK';
      var exp=getExpiryStatus(p);
      var expHtml='<span style="color:var(--txt2);font-size:11px">-</span>';
      var rowStyle='';
      if(exp){
        expHtml='<span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;background:'+exp.bg+';color:'+exp.color+'">'+exp.label+'</span>';
        if(exp.status==='expired')rowStyle='background:rgba(255,71,87,.06);border-left:3px solid #ff4757';
        else if(exp.status==='critical')rowStyle='background:rgba(255,99,72,.04);border-left:3px solid #ff6348';
        else if(exp.status==='warning')rowStyle='background:rgba(243,156,18,.04);border-left:3px solid #f39c12';
      }
      return '<tr style="'+rowStyle+'"><td style="font-size:24px">'+p.emoji+'</td><td><strong>'+p.name+'</strong>'+(isWeightProduct(p)?' <span class="badge-sm b-blue" style="font-size:9px">⚖ PESO</span>':'')+'</td><td><span class="badge-sm b-blue">'+p.cat+'</span></td><td style="font-weight:700;color:var(--accent)">'+formatMoney(p.price)+'</td><td>'+(p.cost?'<span style="font-size:11px;color:var(--txt2)">Custo: '+formatMoney(p.cost)+(p.markup?' ('+p.markup+'%)':'')+'</span><br>':'')+p.stock+' '+p.unit+' <span class="badge-sm '+stockClass+'" style="margin-left:4px">'+stockLabel+'</span></td><td>'+(p.expiryDate?'<span style="font-size:11px">'+formatExpiryDate(p.expiryDate)+'</span><br>':'')+(p.lot?'<span style="font-size:10px;color:var(--txt2)">Lote: '+p.lot+'</span><br>':'')+expHtml+'</td><td><div class="action-btns"><button onclick="openProductModal('+p.id+')" title="Editar"><i data-lucide="pencil" style="width:14px;height:14px"></i></button><button class="danger" onclick="deleteProduct('+p.id+')" title="Excluir"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button></div></td></tr>';
    }).join('');
    $('prodTableBody').innerHTML=html||'<tr><td colspan="7" class="empty-msg">Nenhum produto encontrado</td></tr>';
  }
  window.openProductModal=function(id){
    var p=id?DB.products.find(function(x){return x.id===id}):null;
    var cats=['Alimentacao','Higiene','Acessorios','Brinquedos','Casas e Camas','Transporte','Saude','Roupas','Outros'];
    var emojis=['🐕','🐱','🐶','🐈','🦴','🐟','🍗','🥩','🧴','💊','💉','🏠','🛏️','🔗','📿','🪮','✂️','🐾','✨'];
    if(p&&emojis.indexOf(p.emoji)===-1)emojis.push(p.emoji);
    var cost=p?(p.cost||''):'';
    var markup=p?(p.markup||''):'';
    var body=pkField('product',id)+
      '<label>Emoji</label><select id="pEmoji">'+emojis.map(function(e){return '<option'+(p&&p.emoji===e?' selected':'')+'>'+e+'</option>'}).join('')+'</select>'+
      '<label>Nome</label><input type="text" id="pName" value="'+(p?p.name:'')+'">'+
      '<label>Categoria</label><select id="pCat">'+cats.map(function(c){return '<option'+(p&&p.cat===c?' selected':'')+'>'+c+'</option>'}).join('')+'</select>'+

      '<div style="background:var(--bg3);border-radius:var(--r);padding:14px;margin:8px 0;border:1px solid var(--border)">'+
      '<div style="font-size:12px;font-weight:700;color:var(--accent);margin-bottom:10px"><i data-lucide="banknote" style="width:16px;height:16px;vertical-align:middle"></i> Precificacao</div>'+
      '<label>Preco de Custo (R$)</label>'+
      '<input type="number" step="0.01" id="pCost" value="'+cost+'" placeholder="0,00" oninput="calcMarkupPrice()">'+
      '<label>Markup (%) — Margem sobre o custo</label>'+
      '<input type="number" step="0.1" id="pMarkup" value="'+markup+'" placeholder="Ex: 50 para 50%" oninput="calcMarkupPrice()">'+
      '<div id="calcPricePreview" style="margin-top:8px;padding:10px;background:var(--bg);border-radius:6px;font-size:12px;color:var(--txt2);display:'+(cost&&markup?'block':'none')+'"></div>'+
      '</div>'+

      '<label>Preco de Venda (R$) <span style="font-size:11px;color:var(--txt2)">(preencha manualmente ou calcule acima)</span></label>'+
      '<input type="number" step="0.01" id="pPrice" value="'+(p?p.price:'')+'">'+

      '<label>Estoque</label><input type="number" id="pStock" value="'+(p?p.stock:'')+'">'+
      '<label>Estoque Minimo</label><input type="number" id="pMinStock" value="'+(p?p.minStock:'10')+'">'+
      '<label>Unidade</label><select id="pUnit"><option'+(p&&p.unit==='kg'?' selected':'')+'>kg</option><option'+(p&&p.unit==='g'?' selected':'')+'>g</option><option'+(p&&p.unit==='L'?' selected':'')+'>L</option><option'+(p&&p.unit==='ml'?' selected':'')+'>ml</option><option'+(p&&p.unit==='un'?' selected':'')+'>un</option></select>'+
      '<label>Produto Pesavel (Balanca)</label><select id="pWeighable"><option value="auto"'+(!p||p.weighable===undefined||p.weighable===null?' selected':'')+'>Auto (por unidade)</option><option value="true"'+(p&&p.weighable===true?' selected':'')+'>Sim — Vende por Peso (Balanca)</option><option value="false"'+(p&&p.weighable===false?' selected':'')+'>Nao — Vende por Unidade</option></select>'+
      '<div class="settings-hint">Se "Sim", o PDV vai pedir o peso na balanca ao adicionar este produto.</div>'+
      '<label>Barcode</label><div style="display:flex;gap:6px;align-items:flex-end"><input type="text" id="pBarcode" value="'+(p?p.barcode:'')+'" style="flex:1" placeholder="Digite ou escaneie o codigo de barras"><button type="button" class="scan-barcode-btn" onclick="openBarcodeScanner(\'product\')" title="Escanear codigo de barras com a camera">📷 Escanear</button></div>'+
      '<div class="settings-hint">Use a camera do celular/computador para ler o codigo de barras automaticamente.</div>'+

      '<div style="background:var(--bg3);border-radius:var(--r);padding:14px;margin:8px 0;border:1px solid var(--border)">'+
      '<div style="font-size:12px;font-weight:700;color:var(--accent);margin-bottom:10px"><i data-lucide="calendar" style="width:16px;height:16px;vertical-align:middle"></i> Validade e Lote</div>'+
      '<label>Data de Validade</label>'+
      '<input type="date" id="pExpiry" value="'+(p&&p.expiryDate?p.expiryDate:'')+'">'+
      '<label>Lote</label>'+
      '<input type="text" id="pLot" value="'+(p&&p.lot?p.lot:'')+'" placeholder="Numero do lote">'+
      '</div>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveProduct('+(id?id:'null')+')">'+(p?'Salvar':'Adicionar')+'</button>';
    openModal(p?'Editar Produto':'Novo Produto',body,foot);
    setTimeout(function(){if(cost&&markup)calcMarkupPrice()},100);
  };

  window.calcMarkupPrice=function(){
    var cost=parseFloat($('pCost').value)||0;
    var markup=parseFloat($('pMarkup').value)||0;
    var preview=document.getElementById('calcPricePreview');
    if(!preview)return;
    if(cost>0&&markup>=0){
      var salePrice=cost+(cost*markup/100);
      preview.style.display='block';
      preview.innerHTML='<strong style="color:var(--accent)">Preco de Venda: '+formatMoney(salePrice)+'</strong>'+
        '<br>Custo: '+formatMoney(cost)+' + '+markup+'% = '+formatMoney(salePrice)+
        '<br><span style="font-size:11px">Lucro: '+formatMoney(salePrice-cost)+' ('+markup+'%)</span>';
      $('pPrice').value=salePrice.toFixed(2);
    }else{
      preview.style.display='none';
    }
  };
  window.saveProduct=function(id){
    var data={
      emoji:$('pEmoji').value,
      name:$('pName').value.trim(),
      cat:$('pCat').value,
      price:parseFloat($('pPrice').value)||0,
      cost:parseFloat($('pCost').value)||0,
      markup:parseFloat($('pMarkup').value)||0,
      stock:parseInt($('pStock').value)||0,
      minStock:parseInt($('pMinStock').value)||10,
      unit:$('pUnit').value,
      weighable:$('pWeighable').value==='true'?true:$('pWeighable').value==='false'?false:undefined,
      barcode:$('pBarcode').value.trim(),
      expiryDate:$('pExpiry').value||null,
      lot:$('pLot').value.trim()||null
    };
    if(!data.name){toast('Nome obrigatorio!','error');return}
    if(id){
      var idx=DB.products.findIndex(function(p){return p.id===id});
      if(idx!==-1){DB.products[idx]=Object.assign(DB.products[idx],data)}
      logActivity('PRODUTO_EDITADO','Produto: '+data.name);
      toast('Produto atualizado!','success');
    }else{
      data.id=genId('product');
      DB.products.push(data);
      logActivity('PRODUTO_CRIADO','Produto: '+data.name+' — '+formatMoney(data.price));
      toast('Produto adicionado!','success');
    }
    saveDB();closeModal();renderProductTable();
  };
  window.deleteProduct=function(id){
    if(!hasFuncPermission('deleteProduct')){toast('Sem permissao para excluir produto!','error');return}
    if(!confirm('Excluir este produto?'))return;
    var p=DB.products.find(function(x){return x.id===id});
    DB.products=DB.products.filter(function(p){return p.id!==id});
    logActivity('PRODUTO_EXCLUIDO','Produto: '+(p?p.name:'ID '+id));
    saveDB();renderProductTable();toast('Produto excluido!','success');
  };

  window.openBulkPriceIncrease=function(){
    if(!hasFuncPermission('bulkPriceIncrease')){toast('Sem permissao para aumentar preco em massa!','error');return}
    var body=
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r);margin-bottom:16px;border:1px solid var(--border)">'+
      '<div style="font-size:12px;font-weight:700;color:var(--accent);margin-bottom:8px"><i data-lucide="package" style="width:16px;height:16px;vertical-align:middle"></i> Produtos atuais: <strong>'+DB.products.length+'</strong></div>'+
      '<div style="font-size:11px;color:var(--txt2)">Todos os produtos terao o preco aumentado pela percentagem informada.</div>'+
      '</div>'+
      '<label>Percentual de Aumento (%)</label>'+
      '<input type="number" step="0.01" id="bulkPricePercent" placeholder="Ex: 10 para 10%" min="0.01" style="font-size:20px;font-weight:700;text-align:center;padding:16px" oninput="previewBulkPrice()">'+
      '<div id="bulkPricePreview" style="margin-top:12px;padding:12px;background:var(--bg3);border-radius:var(--r);border:1px solid var(--border);display:none"></div>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" id="applyBulkPriceBtn" onclick="applyBulkPrice()" disabled style="opacity:0.5">Aplicar Aumento</button>';
    openModal('Aumentar Preco — Todos os Produtos',body,foot);
  };

  window.previewBulkPrice=function(){
    var pct=parseFloat($('bulkPricePercent').value)||0;
    var preview=document.getElementById('bulkPricePreview');
    var btn=document.getElementById('applyBulkPriceBtn');
    if(!preview||!btn)return;
    if(pct<=0){preview.style.display='none';btn.disabled=true;btn.style.opacity='0.5';return}
    var factor=1+(pct/100);
    var minPrice=Infinity,maxPrice=0,minNew=Infinity,maxNew=0;
    DB.products.forEach(function(p){
      if(p.price<minPrice){minPrice=p.price;minNew=p.price*factor}
      if(p.price>maxPrice){maxPrice=p.price;maxNew=p.price*factor}
    });
    preview.style.display='block';
    preview.innerHTML=
      '<div style="font-size:12px;font-weight:700;color:var(--accent);margin-bottom:8px"><i data-lucide="trending-up" style="width:16px;height:16px;vertical-align:middle"></i> Preview do Aumento</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:12px">'+
      '<div><span style="color:var(--txt2)">Menor preco:</span> <strong>'+formatMoney(minPrice)+'</strong> → <strong style="color:var(--success)">'+formatMoney(minNew)+'</strong></div>'+
      '<div><span style="color:var(--txt2)">Maior preco:</span> <strong>'+formatMoney(maxPrice)+'</strong> → <strong style="color:var(--success)">'+formatMoney(maxNew)+'</strong></div>'+
      '<div style="grid-column:1/-1"><span style="color:var(--txt2)">Produtos afetados:</span> <strong>'+DB.products.length+'</strong></div>'+
      '</div>';
    btn.disabled=false;btn.style.opacity='1';
  };

  window.applyBulkPrice=function(){
    var pct=parseFloat($('bulkPricePercent').value)||0;
    if(pct<=0){toast('Informe um percentual valido!','error');return}
    if(!confirm('Aumentar o preco de TODOS os '+DB.products.length+' produtos em '+pct+'%?'))return;
    var factor=1+(pct/100);
    var count=0;
    DB.products.forEach(function(p){
      p.price=parseFloat((p.price*factor).toFixed(2));
      count++;
    });
    saveDB();
    closeModal();
    renderProducts($('mainContent'));
    toast('Preco aumentado em '+pct+'% para '+count+' produtos!','success');
    logActivity('PRECO_AUMENTO_MASSA','Aumento de '+pct+'% aplicado a '+count+' produtos');
  };

  // ===== STOCK =====
  function renderStock(m){
    var cats=[...new Set(DB.products.map(function(p){return p.cat}))];
    var totalItems=DB.products.reduce(function(s,p){return s+p.stock},0);
    var totalValue=DB.products.reduce(function(s,p){return s+(p.price*p.stock)},0);
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="clipboard-list" style="width:24px;height:24px;vertical-align:middle"></i> Controle de Estoque</h2></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="package"></i></div><div class="sc-value">'+totalItems+'</div><div class="sc-label">Itens em Estoque</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="banknote"></i></div><div class="sc-value">'+formatMoney(totalValue)+'</div><div class="sc-label">Valor Total</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="alert-triangle"></i></div><div class="sc-value" style="color:var(--danger)">'+DB.products.filter(function(p){return p.stock<=p.minStock}).length+'</div><div class="sc-label">Abaixo do Minimo</div></div>'+
      '</div>'+
      '<div class="table-wrap"><div class="table-header"><h3>Movimentacao de Estoque</h3>'+
      '<input type="text" class="table-search" id="stockSearch" placeholder="Buscar..."></div>'+
      '<table><thead><tr><th></th><th>Produto</th><th>Categoria</th><th>Atual</th><th>Minimo</th><th>Status</th><th>Acao</th></tr></thead>'+
      '<tbody id="stockTableBody"></tbody></table></div>';
    renderStockTable();
    $('stockSearch').addEventListener('input',renderStockTable);
  }
  function renderStockTable(){
    var search=($('stockSearch')?$('stockSearch').value:'').trim().toLowerCase();
    var items=DB.products.filter(function(p){return p.name.toLowerCase().includes(search)});
    $('stockTableBody').innerHTML=items.map(function(p){
      var status=p.stock<=p.minStock?'b-red':p.stock<=p.minStock*2?'b-yellow':'b-green';
      var label=p.stock<=p.minStock?'Critico':p.stock<=p.minStock*2?'Baixo':'Normal';
      return '<tr><td style="font-size:20px">'+p.emoji+'</td><td><strong>'+p.name+'</strong></td><td>'+p.cat+'</td><td style="font-weight:700">'+p.stock+' '+p.unit+'</td><td>'+p.minStock+' '+p.unit+'</td><td><span class="badge-sm '+status+'">'+label+'</span></td><td><div class="action-btns"><button onclick="restockProduct('+p.id+')" title="Repor Estoque"><i data-lucide="package-plus" style="width:14px;height:14px"></i></button><button onclick="adjustStock('+p.id+')" title="Ajustar"><i data-lucide="pencil" style="width:14px;height:14px"></i></button></div></td></tr>';
    }).join('');
  }
  window.restockProduct=function(id){
    if(!hasFuncPermission('restock')){toast('Sem permissao para repor estoque!','error');return}
    var p=DB.products.find(function(x){return x.id===id});
    if(!p)return;
    var body='<label>Produto</label><input type="text" value="'+p.name+'" disabled>'+
      '<label>Estoque Atual</label><input type="text" value="'+p.stock+' '+p.unit+'" disabled>'+
      '<label>Quantidade para Repor</label><input type="number" id="restockQty" value="0" min="1">'+
      '<div style="border-top:1px solid var(--border);margin:12px 0;padding-top:12px">'+
      '<label style="font-weight:700;color:var(--accent)">Preco de Custo (opcional)</label>'+
      '<input type="number" step="0.01" id="restockCost" value="" placeholder="'+(p.cost?p.cost.toFixed(2):'0.00')+'">'+
      '<label>Markup (%)</label>'+
      '<input type="number" step="0.1" id="restockMarkup" value="'+(p.markup||0)+'" placeholder="Ex: 50 para 50%">'+
      '<div style="font-size:12px;color:var(--txt2);margin-top:4px">Preco de venda atual: <strong>'+formatMoney(p.price)+'</strong>'+
      ' | Custo atual: <strong>'+(p.cost?formatMoney(p.cost):'—')+'</strong></div>'+
      '<div id="restockPricePreview" style="font-size:13px;color:var(--accent);margin-top:4px;font-weight:600"></div>'+
      '</div>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="doRestock('+id+')">Repor</button>';
    openModal('Repor Estoque',body,foot);
    setTimeout(function(){
      var costEl=$('restockCost');
      var markupEl=$('restockMarkup');
      if(costEl&&markupEl){
        costEl.addEventListener('input',calcRestockPreview);
        markupEl.addEventListener('input',calcRestockPreview);
      }
    },100);
  };
  function calcRestockPreview(){
    var cost=parseFloat($('restockCost').value)||0;
    var markup=parseFloat($('restockMarkup').value)||0;
    var el=$('restockPricePreview');
    if(!el)return;
    if(cost>0){
      var salePrice=cost+(cost*markup/100);
      el.innerHTML='Novo preco de venda: <strong>'+formatMoney(salePrice)+'</strong>'+
        (markup>0?' (custo '+formatMoney(cost)+' + '+markup+'% markup)':'');
    }else{
      el.innerHTML='';
    }
  }
  window.doRestock=function(id){
    var qty=parseInt($('restockQty').value)||0;
    if(qty<=0){toast('Quantidade invalida!','error');return}
    var p=DB.products.find(function(x){return x.id===id});
    p.stock+=qty;
    var costVal=parseFloat($('restockCost').value);
    var markupVal=parseFloat($('restockMarkup').value)||0;
    var logDetail=p.name+' — +'+qty+' '+p.unit+' (total: '+p.stock+')';
    if(!isNaN(costVal)&&costVal>0){
      var oldCost=p.cost||0;
      var oldPrice=p.price;
      p.cost=costVal;
      p.markup=markupVal;
      p.price=Math.round((costVal+(costVal*markupVal/100))*100)/100;
      logDetail+=' | Custo: '+formatMoney(oldCost)+' → '+formatMoney(costVal)+' | Preco: '+formatMoney(oldPrice)+' → '+formatMoney(p.price);
    }
    logActivity('ESTOQUE_REPOSTO',logDetail);
    saveDB();closeModal();renderStockTable();refreshPDVPrices();toast('Estoque reposto! +'+qty+' '+p.unit,'success');
  };
  window.adjustStock=function(id){
    if(!hasFuncPermission('adjustStock')){toast('Sem permissao para ajustar estoque!','error');return}
    var p=DB.products.find(function(x){return x.id===id});
    if(!p)return;
    var body='<label>Produto</label><input type="text" value="'+p.name+'" disabled>'+
      '<label>Estoque Atual</label><input type="text" value="'+p.stock+' '+p.unit+'" disabled>'+
      '<label>Novo Valor</label><input type="number" id="adjustQty" value="'+p.stock+'" min="0">';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="doAdjust('+id+')">Ajustar</button>';
    openModal('Ajustar Estoque',body,foot);
  };
  window.doAdjust=function(id){
    var val=parseInt($('adjustQty').value);
    if(isNaN(val)||val<0){toast('Valor invalido!','error');return}
    var p=DB.products.find(function(x){return x.id===id});
    p.stock=val;
    logActivity('ESTOQUE_AJUSTADO',p.name+' — novo valor: '+val+' '+p.unit);
    saveDB();closeModal();renderStockTable();toast('Estoque ajustado!','success');
  };

  // ===== EMPLOYEES =====
  function renderEmployees(m){
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="users" style="width:24px;height:24px;vertical-align:middle"></i> Funcionarios</h2><div class="header-actions">'+
      '<button class="btn btn-primary" onclick="openEmployeeModal()">+ Novo Funcionario</button>'+
      '</div></div>'+
      '<div class="table-wrap"><div class="table-header"><h3>'+DB.employees.length+' funcionarios</h3>'+
      '<input type="text" class="table-search" id="empSearch" placeholder="Buscar..."></div>'+
      '<table><thead><tr><th>Nome</th><th>Cargo</th><th>Turno</th><th>Salario</th><th>Telefone</th><th>Status</th><th>Acoes</th></tr></thead>'+
      '<tbody id="empTableBody"></tbody></table></div>';
    renderEmpTable();
    $('empSearch').addEventListener('input',renderEmpTable);
  }
  function renderEmpTable(){
    var search=($('empSearch')?$('empSearch').value:'').trim().toLowerCase();
    var items=DB.employees.filter(function(e){return e.name.toLowerCase().includes(search)});
    $('empTableBody').innerHTML=items.map(function(e){
      return '<tr><td><strong>'+e.name+'</strong></td><td><span class="badge-sm b-purple">'+e.role+'</span></td><td>'+e.shift+'</td><td style="font-weight:700;color:var(--accent)">'+formatMoney(e.salary)+'</td><td style="color:var(--txt2)">'+e.phone+'</td><td>'+(e.active?'<span class="badge-sm b-green">Ativo</span>':'<span class="badge-sm b-red">Inativo</span>')+'</td><td><div class="action-btns"><button onclick="openEmployeeModal('+e.id+')" title="Editar"><i data-lucide="pencil" style="width:14px;height:14px"></i></button><button class="danger" onclick="toggleEmployee('+e.id+')" title="'+(e.active?'Desativar':'Ativar')+'">'+(e.active?'⏻':'✓')+'</button></div></td></tr>';
    }).join('');
  }
  window.openEmployeeModal=function(id){
    var e=id?DB.employees.find(function(x){return x.id===id}):null;
    var body=pkField('employee',id)+
      '<label>Nome Completo</label><input type="text" id="eName" value="'+(e?e.name:'')+'">'+
      '<label>Cargo</label><select id="eRole"><option'+(e&&e.role==='Caixa'?' selected':'')+'>Caixa</option><option'+(e&&e.role==='Estoque'?' selected':'')+'>Estoque</option><option'+(e&&e.role==='Repositor'?' selected':'')+'>Repositor</option><option'+(e&&e.role==='Gerente'?' selected':'')+'>Gerente</option><option'+(e&&e.role==='Auxiliar'?' selected':'')+'>Auxiliar</option></select>'+
      '<label>Turno</label><select id="eShift"><option'+(e&&e.shift==='Manha'?' selected':'')+'>Manha</option><option'+(e&&e.shift==='Tarde'?' selected':'')+'>Tarde</option><option'+(e&&e.shift==='Noite'?' selected':'')+'>Noite</option><option'+(e&&e.shift==='Integral'?' selected':'')+'>Integral</option></select>'+
      '<label>Salario (R$)</label><input type="number" step="0.01" id="eSalary" value="'+(e?e.salary:'')+'">'+
      '<label>Telefone</label><input type="text" id="ePhone" value="'+(e?e.phone:'')+'">';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveEmployee('+(id?id:'null')+')">'+(e?'Salvar':'Adicionar')+'</button>';
    openModal(e?'Editar Funcionario':'Novo Funcionario',body,foot);
  };
  window.saveEmployee=function(id){
    var data={
      name:$('eName').value.trim(),
      role:$('eRole').value,
      shift:$('eShift').value,
      salary:parseFloat($('eSalary').value)||0,
      phone:$('ePhone').value.trim(),
      active:true
    };
    if(id){
      var existing=DB.employees.find(function(e){return e.id===id});
      if(existing)data.active=existing.active;
    }
    if(!data.name){toast('Nome obrigatorio!','error');return}
    if(id){
      var idx=DB.employees.findIndex(function(e){return e.id===id});
      if(idx!==-1)DB.employees[idx]=Object.assign(DB.employees[idx],data);
      logActivity('FUNC_EDITADO','Funcionario: '+data.name);
      toast('Funcionario atualizado!','success');
    }else{
      data.id=genId('employee');
      DB.employees.push(data);
      logActivity('FUNC_CRIADO','Funcionario: '+data.name+' — '+data.role);
      toast('Funcionario adicionado!','success');
    }
    saveDB();closeModal();renderEmpTable();
  };
  window.toggleEmployee=function(id){
    var e=DB.employees.find(function(x){return x.id===id});
    e.active=!e.active;
    logActivity('FUNC_STATUS',e.name+' — '+(e.active?'ativado':'desativado'));
    saveDB();renderEmpTable();
    toast(e.name+(e.active?' ativado':' desativado'),'info');
  };

  // ===== USERS =====
  function renderUsers(m){
    var activeCount=DB.users.filter(function(u){return u.active}).length;
    var adminCount=DB.users.filter(function(u){return u.type==='admin'}).length;
    var funcCount=DB.users.filter(function(u){return u.type==='func'}).length;
    var clientCount=DB.users.filter(function(u){return u.type==='cliente'}).length;
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="user" style="width:24px;height:24px;vertical-align:middle"></i> Usuarios</h2><div class="header-actions">'+
      '<button class="btn btn-primary" onclick="openUserModal()">+ Novo Usuario</button>'+
      '</div></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="users"></i></div><div class="sc-value">'+DB.users.length+'</div><div class="sc-label">Total</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="user-check"></i></div><div class="sc-value" style="color:var(--success)">'+activeCount+'</div><div class="sc-label">Ativos</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="shield"></i></div><div class="sc-value" style="color:#e74c3c">'+adminCount+'</div><div class="sc-label">Admins</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="briefcase"></i></div><div class="sc-value" style="color:#3498db">'+funcCount+'</div><div class="sc-label">Funcionarios</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="user-round"></i></div><div class="sc-value" style="color:#2ecc71">'+clientCount+'</div><div class="sc-label">Clientes</div></div>'+
      '</div>'+
      '<div class="table-wrap"><div class="table-header"><h3>'+DB.users.length+' usuarios</h3>'+
      '<input type="text" class="table-search" id="usrSearch" placeholder="Buscar..."></div>'+
      '<table><thead><tr><th>Nome</th><th>Usuario</th><th>Tipo</th><th>Status</th><th>Acoes</th></tr></thead>'+
      '<tbody id="usrTableBody"></tbody></table></div>';
    renderUsrTable();
    $('usrSearch').addEventListener('input',renderUsrTable);
  }
  function renderUsrTable(){
    var search=($('usrSearch')?$('usrSearch').value:'').trim().toLowerCase();
    var items=DB.users.filter(function(u){return u.name.toLowerCase().includes(search)||u.username.toLowerCase().includes(search)});
    $('usrTableBody').innerHTML=items.map(function(u){
      var typeClass=u.type==='admin'?'b-red':u.type==='func'?'b-blue':'b-green';
      var typeLabel=u.type==='admin'?'Admin':u.type==='func'?'Func':'Cliente';
      var actions='<div class="action-btns">';
      actions+='<button onclick="viewUserDetails('+u.id+')" title="Ver Detalhes" style="background:rgba(30,144,255,.15);color:var(--blue)"><i data-lucide="eye" style="width:14px;height:14px"></i></button>';
      actions+='<button onclick="openUserModal('+u.id+')" title="Editar"><i data-lucide="pencil" style="width:14px;height:14px"></i></button>';
      actions+='<button onclick="resetUserPassword('+u.id+')" title="Redefinir Senha" style="background:rgba(243,156,18,.15);color:#f39c12"><i data-lucide="key" style="width:14px;height:14px"></i></button>';
      actions+='<button onclick="toggleUser('+u.id+')" title="'+(u.active?'Desativar':'Ativar')+'" style="background:'+(u.active?'rgba(255,71,87,.15)':'rgba(46,213,115,.15)')+';'+(u.active?'color:var(--danger)':'color:var(--success)')+'">'+(u.active?'⏻':'✓')+'</button>';
      actions+='<button class="danger" onclick="deleteUser('+u.id+')" title="Excluir"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>';
      actions+='</div>';
      return '<tr><td><strong>'+u.name+'</strong></td><td style="color:var(--txt2)">@'+u.username+'</td><td><span class="badge-sm '+typeClass+'">'+typeLabel+'</span></td><td>'+(u.active?'<span class="badge-sm b-green">Ativo</span>':'<span class="badge-sm b-red">Inativo</span>')+'</td><td>'+actions+'</td></tr>';
    }).join('');
    if(items.length===0)$('usrTableBody').innerHTML='<tr><td colspan="5" class="empty-msg">Nenhum usuario encontrado</td></tr>';
    if(typeof lucide!=='undefined')lucide.createIcons();
  }
  window.viewUserDetails=function(id){
    var u=DB.users.find(function(x){return x.id===id});
    if(!u)return;
    var typeLabel=u.type==='admin'?'Administrador':u.type==='func'?'Funcionario':'Cliente';
    var typeClass=u.type==='admin'?'b-red':u.type==='func'?'b-blue':'b-green';
    var userSales=(DB.sales||[]).filter(function(s){return s.cashier===u.name&&s.status!=='cancelado'});
    var totalSales=userSales.reduce(function(s,v){return s+v.total},0);
    var lastSale=userSales.length>0?userSales.sort(function(a,b){return new Date(b.date)-new Date(a.date)})[0]:null;
    var userLogs=(DB.activityLog||[]).filter(function(l){return l.user===u.name}).slice(-10).reverse();
    var logsHtml=userLogs.length>0?userLogs.map(function(l){
      return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px"><span style="color:var(--txt2)">'+l.action+'</span><span>'+formatDate(l.date)+'</span></div>';
    }).join(''):'<div style="padding:12px;color:var(--txt2);font-size:13px">Nenhuma atividade registrada</div>';
    var html='<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">'+
      '<div><label style="color:var(--txt2);font-size:12px">Nome</label><div style="font-weight:700;font-size:15px">'+u.name+'</div></div>'+
      '<div><label style="color:var(--txt2);font-size:12px">Usuario</label><div style="font-weight:700;font-size:15px">@'+u.username+'</div></div>'+
      '<div><label style="color:var(--txt2);font-size:12px">Tipo</label><div><span class="badge-sm '+typeClass+'">'+typeLabel+'</span></div></div>'+
      '<div><label style="color:var(--txt2);font-size:12px">Status</label><div><span class="badge-sm '+(u.active?'b-green':'b-red')+'">'+(u.active?'Ativo':'Inativo')+'</span></div></div>'+
      '</div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r);margin-bottom:16px">'+
      '<h4 style="margin:0 0 8px;font-size:14px"><i data-lucide="bar-chart" style="width:14px;height:14px;vertical-align:middle"></i> Estatisticas</h4>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+
      '<div style="padding:8px;background:var(--bg2);border-radius:8px;text-align:center"><div style="font-size:20px;font-weight:800;color:var(--accent)">'+userSales.length+'</div><div style="font-size:11px;color:var(--txt2)">Vendas Realizadas</div></div>'+
      '<div style="padding:8px;background:var(--bg2);border-radius:8px;text-align:center"><div style="font-size:20px;font-weight:800;color:var(--success)">'+formatMoney(totalSales)+'</div><div style="font-size:11px;color:var(--txt2)">Total Vendido</div></div>'+
      '</div>'+
      (lastSale?'<div style="margin-top:8px;font-size:12px;color:var(--txt2)">Ultima venda: '+formatDate(lastSale.date)+' — '+formatMoney(lastSale.total)+'</div>':'')+
      '</div>'+
      '<div>'+
      '<h4 style="margin:0 0 8px;font-size:14px"><i data-lucide="activity" style="width:14px;height:14px;vertical-align:middle"></i> Atividade Recente</h4>'+
      '<div style="background:var(--bg3);border-radius:var(--r);padding:8px 12px">'+logsHtml+'</div>'+
      '</div>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Fechar</button>'+
      '<button class="btn btn-primary" onclick="closeModal();openUserModal('+u.id+')">Editar</button>';
    openModal('Detalhes do Usuario',html,foot);
    if(typeof lucide!=='undefined')lucide.createIcons();
  };
  window.resetUserPassword=function(id){
    var u=DB.users.find(function(x){return x.id===id});
    if(!u)return;
    var body='<div style="padding:12px;background:var(--bg3);border-radius:var(--r);margin-bottom:16px;font-size:13px">Redefinir senha de: <strong>'+u.name+'</strong> (@'+u.username+')</div>'+
      '<label>Nova Senha</label><input type="password" id="resetPass" placeholder="Digite a nova senha" minlength="6">'+
      '<label>Confirmar Senha</label><input type="password" id="resetPassConfirm" placeholder="Confirme a nova senha" minlength="6">'+
      '<div style="margin-top:8px;font-size:12px;color:var(--txt2)">A senha deve ter no minimo 6 caracteres</div>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>'+
      '<button class="btn btn-primary" onclick="confirmResetPassword('+u.id+')">Redefinir Senha</button>';
    openModal('Redefinir Senha',body,foot);
  };
  window.confirmResetPassword=function(id){
    var pass=$('resetPass').value;
    var confirm=$('resetPassConfirm').value;
    if(!pass||pass.length<6){toast('A senha deve ter no minimo 6 caracteres!','error');return}
    if(pass!==confirm){toast('As senhas nao conferem!','error');return}
    var idx=DB.users.findIndex(function(u){return u.id===id});
    if(idx===-1){toast('Usuario nao encontrado!','error');return}
    DB.users[idx].password=pass;
    logActivity('USER_SENHA_REDEFINIDA','Senha redefinida para: '+DB.users[idx].name);
    saveDB();closeModal();toast('Senha redefinida com sucesso!','success');
  };
  window.deleteUser=function(id){
    var u=DB.users.find(function(x){return x.id===id});
    if(!u)return;
    if(u.id===currentUser.id){toast('Nao e possivel excluir seu proprio usuario!','error');return}
    var body='<div style="padding:12px;background:rgba(255,71,87,.1);border:1px solid rgba(255,71,87,.3);border-radius:var(--r);margin-bottom:16px">Tem certeza que deseja excluir o usuario <strong>'+u.name+'</strong> (@'+u.username+')?</div>'+
      '<div style="font-size:13px;color:var(--txt2)">Esta acao nao pode ser desfeita. O usuario sera removido permanentemente do sistema.</div>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>'+
      '<button class="btn btn-danger" onclick="confirmDeleteUser('+u.id+')">Excluir</button>';
    openModal('Excluir Usuario',body,foot);
  };
  window.confirmDeleteUser=function(id){
    DB.users=DB.users.filter(function(u){return u.id!==id});
    var uName=DB.users.find(function(x){return x.id===id});
    logActivity('USER_EXCLUIDO','Usuario excluido: '+(uName?uName.name:'ID '+id));
    saveDB();closeModal();renderUsrTable();toast('Usuario excluido!','info');
  };
  window.openUserModal=function(id){
    var u=id?DB.users.find(function(x){return x.id===id}):null;
    var body=pkField('user',id)+
      '<label>Nome Completo</label><input type="text" id="uName" value="'+(u?u.name:'')+'">'+
      '<label>Nome de Usuario</label><input type="text" id="uUsername" value="'+(u?u.username:'')+'">'+
      '<label>Senha</label><input type="password" id="uPassword" value="" placeholder="'+(u?'Deixe vazio para manter':'')+'">'+
      '<label>Tipo</label><select id="uType"><option value="admin"'+(u&&u.type==='admin'?' selected':'')+'>Administrador</option><option value="func"'+(u&&u.type==='func'?' selected':'')+'>Funcionario</option><option value="cliente"'+(u&&u.type==='cliente'?' selected':'')+'>Cliente</option></select>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveUser('+(id?id:'null')+')">'+(u?'Salvar':'Adicionar')+'</button>';
    openModal(u?'Editar Usuario':'Novo Usuario',body,foot);
  };
  window.saveUser=function(id){
    var data={
      name:$('uName').value.trim(),
      username:$('uUsername').value.trim(),
      type:$('uType').value,
      active:true
    };
    var pass=$('uPassword').value.trim();
    if(pass)data.password=pass;
    if(id){
      var existing=DB.users.find(function(u){return u.id===id});
      if(existing)data.active=existing.active;
    }
    if(!data.name||!data.username){toast('Preencha nome e usuario!','error');return}
    if(id){
      var idx=DB.users.findIndex(function(u){return u.id===id});
      if(idx!==-1)DB.users[idx]=Object.assign(DB.users[idx],data);
      logActivity('USER_EDITADO','Usuario: '+data.name);
      toast('Usuario atualizado!','success');
    }else{
      if(!pass){toast('Senha obrigatoria!','error');return}
      data.id=genId('user');
      DB.users.push(data);
      logActivity('USER_CRIADO','Usuario: '+data.name+' (@'+data.username+') — '+data.type);
      toast('Usuario criado!','success');
    }
    saveDB();closeModal();renderUsrTable();
  };
  window.toggleUser=function(id){
    var u=DB.users.find(function(x){return x.id===id});
    u.active=!u.active;
    logActivity('USER_STATUS',u.name+' — '+(u.active?'ativado':'desativado'));
    saveDB();renderUsrTable();
    toast(u.name+(u.active?' ativado':' desativado'),'info');
  };

  // ===== CATEGORIES =====
  function renderCategories(m){
    var cats={};
    DB.products.forEach(function(p){
      if(!cats[p.cat])cats[p.cat]={count:0,value:0};
      cats[p.cat].count++;
      cats[p.cat].value+=p.price*p.stock;
    });
    var html=Object.keys(cats).map(function(c){
      return '<div class="stat-card"><div class="sc-icon"><i data-lucide="tag"></i></div><div class="sc-value">'+cats[c].count+'</div><div class="sc-label">'+c+'</div><div class="sc-change" style="color:var(--accent)">'+formatMoney(cats[c].value)+'</div></div>';
    }).join('');
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="tag" style="width:24px;height:24px;vertical-align:middle"></i> Categorias</h2></div>'+
      '<div class="stats-row">'+html+'</div>';
  }

  // ===== SALES =====
  function renderSales(m){
    var activeSales=DB.sales.filter(function(s){return s.status!=='cancelado'});
    var totalRevenue=activeSales.reduce(function(s,v){return s+v.total},0);
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="banknote" style="width:24px;height:24px;vertical-align:middle"></i> Vendas</h2></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="shopping-cart"></i></div><div class="sc-value">'+activeSales.length+'</div><div class="sc-label">Vendas Ativas</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="banknote"></i></div><div class="sc-value">'+formatMoney(totalRevenue)+'</div><div class="sc-label">Receita Total</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="x-circle"></i></div><div class="sc-value" style="color:var(--danger)">'+(DB.sales.length-activeSales.length)+'</div><div class="sc-label">Canceladas</div></div>'+
      '</div>'+
      '<div class="table-wrap"><div class="table-header"><h3>Historico de Vendas</h3>'+
      '<input type="text" class="table-search" id="saleSearch" placeholder="Buscar..."></div>'+
      '<table><thead><tr><th>#</th><th>Data</th><th>Itens</th><th>Total</th><th>Pagamento</th><th>Caixa</th><th></th></tr></thead>'+
      '<tbody id="saleTableBody"></tbody></table></div>';
    renderSaleTable();
    $('saleSearch').addEventListener('input',renderSaleTable);
  }
  function renderSaleTable(){
    var search=($('saleSearch')?$('saleSearch').value:'').trim().toLowerCase();
    var methodLabels={dinheiro:'💵 Dinheiro',cartao:'💳 Credito',pix:'📱 PIX',debito:'🏦 Debito'};
    var items=DB.sales.filter(function(s){return s.id.toString().includes(search)||s.cashier.toLowerCase().includes(search)});
    $('saleTableBody').innerHTML=items.slice().reverse().map(function(s){
      var payText='';
      if(s.payments&&s.payments.length>1){
        payText=s.payments.map(function(p){return methodLabels[p.method]||p.method}).join(' + ');
      }else{
        payText=methodLabels[s.payment]||s.payment;
      }
      var isCancelled=s.status==='cancelado';
      var statusBadge=isCancelled?'<span style="background:rgba(255,71,87,.15);color:var(--danger);padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;margin-left:6px">Cancelado</span>':'';
      var rowStyle=isCancelled?' style="opacity:0.5;text-decoration:line-through"':'';
      var actions='<button class="btn btn-ghost" style="padding:4px 10px;font-size:11px" onclick="viewSale('+s.id+')">Ver</button>';
      if(!isCancelled){
        actions+=' <button class="btn btn-ghost" style="padding:4px 10px;font-size:11px;color:var(--danger)" onclick="cancelSale('+s.id+')">Cancelar</button>';
      }
      return '<tr'+rowStyle+'><td style="font-weight:700">#'+s.id+statusBadge+'</td><td>'+formatDate(s.date)+'</td><td>'+s.items.length+' itens</td><td style="font-weight:700;color:'+(isCancelled?'var(--danger)':'var(--accent)')+'">'+formatMoney(s.total)+'</td><td>'+payText+'</td><td>'+s.cashier+'</td><td>'+actions+'</td></tr>';
    }).join('');
  }
  window.viewSale=function(id){
    var s=DB.sales.find(function(x){return x.id===id});
    if(!s)return;
    var methodLabels={dinheiro:'Dinheiro',cartao:'Credito',pix:'PIX',debito:'Debito'};
    var methodIcons={dinheiro:'💵',cartao:'💳',pix:'📱',debito:'🏦'};
    var itemsHTML=s.items.map(function(it){
      return '<div class="r-item"><span>'+it.name+' x'+it.qty+'</span><span>'+formatMoney(it.subtotal)+'</span></div>';
    }).join('');
    var paymentHTML='';
    if(s.payments&&s.payments.length>1){
      paymentHTML=s.payments.map(function(p){
        return '<div class="r-item"><span>'+methodIcons[p.method]+' '+methodLabels[p.method]+'</span><span>'+formatMoney(p.amount)+'</span></div>';
      }).join('');
    }else{
      paymentHTML='<div class="r-item"><span>Pagamento:</span><span>'+(methodLabels[s.payment]||s.payment)+'</span></div>';
    }
    var co=getCompanyData();
    var coName=co?(co.fantasyName||co.name||'Empresa'):'PETSHOP PRADO';
    var isCancelled=s.status==='cancelado';
    var statusHTML=isCancelled?'<div style="text-align:center;padding:8px 12px;background:rgba(255,71,87,.15);border-radius:var(--r);margin-bottom:12px;color:var(--danger);font-weight:700;font-size:14px">✖ VENDA CANCELADA</div>':'';
    var html=statusHTML+'<div class="receipt" id="receiptContent">'+
      '<div class="r-header"><h3>'+coName+'</h3>'+
      '<p>Venda #'+s.id+'</p>'+
      '<p>'+formatDate(s.date)+'</p>'+
      '<p>Cupom Nao Fiscal</p></div>'+
      '<hr class="r-divider">'+
      '<div>'+itemsHTML+'</div>'+
      '<hr class="r-divider">'+
      '<div class="r-total"><span>TOTAL</span><span style="color:'+(isCancelled?'var(--danger)':'inherit')+'">'+formatMoney(s.total)+'</span></div>'+
      '<hr class="r-divider">'+
      paymentHTML+
      '<div class="r-item"><span>Atendente:</span><span>'+s.cashier+'</span></div>'+
      '<hr class="r-divider">'+
      '<div class="r-footer">Obrigado pela preferencia!<br>'+coName+'</div></div>';
    var footerBtns='<button class="btn btn-ghost" onclick="printReceipt()"><i data-lucide="printer" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Imprimir</button>';
    if(!isCancelled){
      footerBtns+=' <button class="btn" style="background:var(--danger);color:#fff" onclick="closeModal();cancelSale('+s.id+')">✖ Cancelar Venda</button>';
    }
    footerBtns+='<button class="btn btn-primary" onclick="closeModal()">Fechar</button>';
    openModal('Detalhes da Venda #'+s.id,html,footerBtns,'modal-receipt');
  };

  window.cancelSale=function(id){
    var s=DB.sales.find(function(x){return x.id===id});
    if(!s)return;
    if(s.status==='cancelado'){toast('Venda ja esta cancelada!','error');return}
    var body='<div style="text-align:center;padding:16px 0">'+
      '<div style="font-size:48px;margin-bottom:12px">⚠️</div>'+
      '<div style="font-size:16px;font-weight:700;margin-bottom:8px">Cancelar Venda #'+s.id+'?</div>'+
      '<div style="font-size:13px;color:var(--txt2);margin-bottom:12px">O estoque dos itens sera restaurado.</div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r);margin-bottom:8px">'+
      '<div style="font-size:13px;color:var(--txt2)">Total: <strong style="color:var(--danger)">'+formatMoney(s.total)+'</strong></div>'+
      '<div style="font-size:13px;color:var(--txt2)">Data: '+formatDate(s.date)+'</div>'+
      '<div style="font-size:13px;color:var(--txt2)">Itens: '+s.items.length+'</div></div>'+
      '<div style="font-size:12px;color:var(--txt2)">Esta acao nao pode ser desfeita.</div></div>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Voltar</button>'+
      '<button class="btn" style="background:var(--danger);color:#fff;padding:10px 24px;font-weight:700" onclick="confirmCancelSale('+s.id+')">✖ Confirmar Cancelamento</button>';
    openModal('Cancelar Venda',body,foot,'modal-cancel-sale');
  };

  window.confirmCancelSale=function(id){
    var s=DB.sales.find(function(x){return x.id===id});
    if(!s)return;
    s.status='cancelado';
    s.items.forEach(function(it){
      var prod=DB.products.find(function(p){return p.id===it.productId});
      if(prod)prod.stock+=it.qty;
    });
    saveDB();
    logActivity('VENDA_CANCELADA','Venda #'+s.id+' cancelada — '+formatMoney(s.total));
    closeModal();
    renderSaleTable();
    toast('Venda #'+s.id+' cancelada! Estoque restaurado.','success');
  };

  // ===== VALIDADE / EXPIRY REPORT =====
  function renderExpiryReport(m){
    var all=DB.products.filter(function(p){return p.expiryDate});
    var expired=all.filter(function(p){var s=getExpiryStatus(p);return s&&s.status==='expired'});
    var critical=all.filter(function(p){var s=getExpiryStatus(p);return s&&s.status==='critical'});
    var warning=all.filter(function(p){var s=getExpiryStatus(p);return s&&s.status==='warning'});
    var ok=all.filter(function(p){var s=getExpiryStatus(p);return s&&s.status==='ok'});
    var noDate=DB.products.filter(function(p){return!p.expiryDate});

    var now=new Date();
    var monthNames=['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="calendar" style="width:24px;height:24px;vertical-align:middle"></i> Relatorio de Validade</h2></div>'+

      '<div class="stats-row">'+
      '<div class="stat-card" style="border-left:4px solid #ff4757"><div class="sc-icon"><i data-lucide="x-circle"></i></div><div class="sc-value" style="color:#ff4757">'+expired.length+'</div><div class="sc-label">Vencidos</div></div>'+
      '<div class="stat-card" style="border-left:4px solid #ff6348"><div class="sc-icon"><i data-lucide="circle-dot"></i></div><div class="sc-value" style="color:#ff6348">'+critical.length+'</div><div class="sc-label">Vencem em 30 dias</div></div>'+
      '<div class="stat-card" style="border-left:4px solid #f39c12"><div class="sc-icon"><i data-lucide="circle-dot"></i></div><div class="sc-value" style="color:#f39c12">'+warning.length+'</div><div class="sc-label">Vencem em 90 dias</div></div>'+
      '<div class="stat-card" style="border-left:4px solid #2ed573"><div class="sc-icon"><i data-lucide="check-circle"></i></div><div class="sc-value" style="color:#2ed573">'+ok.length+'</div><div class="sc-label">Validos</div></div>'+
      '<div class="stat-card" style="border-left:4px solid var(--txt2)"><div class="sc-icon"><i data-lucide="circle"></i></div><div class="sc-value">'+noDate.length+'</div><div class="sc-label">Sem Validade</div></div>'+
      '</div>'+

      (expired.length>0?
      '<div class="settings-card" style="margin-bottom:20px;border:2px solid rgba(255,71,87,.3);background:rgba(255,71,87,.05)">'+
      '<h3 style="color:#ff4757">🚫 Produtos Vencidos ('+expired.length+')</h3>'+
      '<div class="table-wrap" style="margin:0"><table><thead><tr><th>Produto</th><th>Categoria</th><th>Lote</th><th>Validade</th><th>Estoque</th></tr></thead><tbody>'+
      expired.map(function(p){
        var exp=getExpiryStatus(p);
        return '<tr style="background:rgba(255,71,87,.06)"><td>'+p.emoji+' <strong>'+p.name+'</strong></td><td><span class="badge-sm b-blue">'+p.cat+'</span></td><td>'+(p.lot||'-')+'</td><td><span style="color:#ff4757;font-weight:700">'+formatExpiryDate(p.expiryDate)+'</span></td><td>'+p.stock+' '+p.unit+'</td></tr>';
      }).join('')+
      '</tbody></table></div></div>':'')+

      (critical.length>0?
      '<div class="settings-card" style="margin-bottom:20px;border:2px solid rgba(255,99,72,.3);background:rgba(255,99,72,.05)">'+
      '<h3 style="color:#ff6348"><i data-lucide="circle-dot" style="width:18px;height:18px;vertical-align:middle"></i> Vencem em Breve — Ate 30 Dias ('+critical.length+')</h3>'+
      '<div class="table-wrap" style="margin:0"><table><thead><tr><th>Produto</th><th>Categoria</th><th>Lote</th><th>Validade</th><th>Dias Restantes</th><th>Estoque</th></tr></thead><tbody>'+
      critical.map(function(p){
        var exp=getExpiryStatus(p);
        return '<tr style="background:rgba(255,99,72,.04)"><td>'+p.emoji+' <strong>'+p.name+'</strong></td><td><span class="badge-sm b-blue">'+p.cat+'</span></td><td>'+(p.lot||'-')+'</td><td style="color:#ff6348;font-weight:700">'+formatExpiryDate(p.expiryDate)+'</td><td><span style="color:#ff6348;font-weight:700">'+exp.days+' dias</span></td><td>'+p.stock+' '+p.unit+'</td></tr>';
      }).join('')+
      '</tbody></table></div></div>':'')+

      (warning.length>0?
      '<div class="settings-card" style="margin-bottom:20px;border:2px solid rgba(243,156,18,.3);background:rgba(243,156,18,.05)">'+
      '<h3 style="color:#f39c12"><i data-lucide="circle-dot" style="width:18px;height:18px;vertical-align:middle"></i> Vencem em 30 a 90 Dias ('+warning.length+')</h3>'+
      '<div class="table-wrap" style="margin:0"><table><thead><tr><th>Produto</th><th>Categoria</th><th>Lote</th><th>Validade</th><th>Dias Restantes</th><th>Estoque</th></tr></thead><tbody>'+
      warning.map(function(p){
        var exp=getExpiryStatus(p);
        return '<tr style="background:rgba(243,156,18,.04)"><td>'+p.emoji+' <strong>'+p.name+'</strong></td><td><span class="badge-sm b-blue">'+p.cat+'</span></td><td>'+(p.lot||'-')+'</td><td style="color:#f39c12;font-weight:700">'+formatExpiryDate(p.expiryDate)+'</td><td><span style="color:#f39c12;font-weight:700">'+exp.days+' dias</span></td><td>'+p.stock+' '+p.unit+'</td></tr>';
      }).join('')+
      '</tbody></table></div></div>':'')+

      (ok.length>0?
      '<div class="settings-card" style="margin-bottom:20px;border:2px solid rgba(46,213,115,.3);background:rgba(46,213,115,.05)">'+
      '<h3 style="color:#2ed573"><i data-lucide="check-circle" style="width:18px;height:18px;vertical-align:middle"></i> Produtos Validos ('+ok.length+')</h3>'+
      '<div class="table-wrap" style="margin:0"><table><thead><tr><th>Produto</th><th>Categoria</th><th>Lote</th><th>Validade</th><th>Dias Restantes</th><th>Estoque</th></tr></thead><tbody>'+
      ok.map(function(p){
        var exp=getExpiryStatus(p);
        return '<tr><td>'+p.emoji+' <strong>'+p.name+'</strong></td><td><span class="badge-sm b-blue">'+p.cat+'</span></td><td>'+(p.lot||'-')+'</td><td>'+formatExpiryDate(p.expiryDate)+'</td><td><span style="color:#2ed573">'+exp.days+' dias</span></td><td>'+p.stock+' '+p.unit+'</td></tr>';
      }).join('')+
      '</tbody></table></div></div>':'')+

      (all.length===0?'<div class="empty-msg" style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--rl);padding:60px"><div style="font-size:48px;margin-bottom:12px"><i data-lucide="calendar" style="width:48px;height:48px"></i></div>Nenhum produto com validade cadastrada.<br>Cadastre produtos com data de validade para acompanhar.</div>':'');
  }

  // ===== EXPENSES / DESPESAS =====
  function renderExpenses(m){
    var now=new Date();
    var curMonth=now.getMonth();
    var curYear=now.getFullYear();
    var monthNames=['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    var monthExpenses=(DB.expenses||[]).filter(function(e){
      var d=new Date(e.date);return d.getMonth()===curMonth&&d.getFullYear()===curYear;
    });
    var monthTotal=monthExpenses.reduce(function(s,e){return s+e.amount},0);
    var todayStr=now.toISOString().slice(0,10);
    var todayExpenses=monthExpenses.filter(function(e){return e.date.slice(0,10)===todayStr});
    var todayTotal=todayExpenses.reduce(function(s,e){return s+e.amount},0);

    var categories=['Aluguel','Funcionarios','Fornecedores','Manutencao','Impostos','Transporte','Material','Marketing','Limpeza','Energia','Agua','Internet','Outros'];

    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="receipt" style="width:24px;height:24px;vertical-align:middle"></i> Despesas</h2></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="calendar"></i></div><div class="sc-value" style="color:var(--danger)">'+formatMoney(todayTotal)+'</div><div class="sc-label">Despesas Hoje</div><div class="sc-change">'+todayExpenses.length+' registros</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="calendar-days"></i></div><div class="sc-value" style="color:var(--danger)">'+formatMoney(monthTotal)+'</div><div class="sc-label">'+monthNames[curMonth]+' — Total</div><div class="sc-change">'+monthExpenses.length+' registros</div></div>'+
      '</div>'+

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">'+
      '<div class="settings-card" style="margin:0">'+
      '<h3>➕ Nova Despesa</h3>'+
      pkField('expense',null)+
      '<label>Nome / Descricao</label>'+
      '<input type="text" id="expName" placeholder="Ex: Aluguel, Fornecedor, Conta de luz...">'+
      '<label>Categoria</label>'+
      '<select id="expCat">'+categories.map(function(c){return '<option>'+c+'</option>'}).join('')+'</select>'+
      '<label>Valor (R$)</label>'+
      '<input type="number" step="0.01" id="expAmount" placeholder="0,00">'+
      '<label>Data</label>'+
      '<input type="date" id="expDate" value="'+todayStr+'">'+
      '<label>Observacao (opcional)</label>'+
      '<input type="text" id="expNote" placeholder="Detalhes...">'+
      '<button class="btn btn-primary" style="margin-top:12px;width:100%" onclick="addExpense()"><i data-lucide="receipt" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Registrar Despesa</button>'+
      '</div>'+

      '<div>'+
      '<div class="settings-card" style="margin:0;margin-bottom:16px">'+
      '<h3><i data-lucide="bar-chart-3" style="width:18px;height:18px;vertical-align:middle"></i> Despesas por Categoria — '+monthNames[curMonth]+'</h3>'+
      renderExpenseChart(monthExpenses)+
      '</div>'+
      '<div class="table-wrap" style="margin:0"><div class="table-header"><h3>Ultimas Despesas</h3>'+
      '<input type="text" class="table-search" id="expSearch" placeholder="Buscar despesa..."></div>'+
      '<table><thead><tr><th>Data</th><th>Nome</th><th>Categoria</th><th>Valor</th><th></th></tr></thead>'+
      '<tbody id="expTableBody"></tbody></table></div>'+
      '</div></div>';

    renderExpenseTable();
    $('expSearch').addEventListener('input',renderExpenseTable);
  }

  function renderExpenseChart(expenses){
    if(expenses.length===0)return '<div class="empty-msg" style="padding:20px">Nenhuma despesa neste mes</div>';
    var cats={};
    expenses.forEach(function(e){cats[e.category]=(cats[e.category]||0)+e.amount});
    var sorted=Object.keys(cats).sort(function(a,b){return cats[b]-cats[a]});
    var max=sorted.length>0?cats[sorted[0]]:1;
    var colors=['#ff4757','#ff6b81','#ff6348','#e17055','#d63031','#fdcb6e','#e17055','#f39c12','#d35400','#c0392b','#e74c3c','#f5515f','#ff4757'];
    var html='<div style="padding:8px 0">';
    sorted.forEach(function(cat,i){
      var pct=max>0?(cats[cat]/max)*100:0;
      html+='<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">'+
        '<span style="font-size:12px;width:100px;text-align:right;color:var(--txt2);flex-shrink:0">'+cat+'</span>'+
        '<div style="flex:1;height:20px;background:var(--bg);border-radius:4px;overflow:hidden">'+
        '<div style="height:100%;width:'+pct+'%;background:'+(colors[i%colors.length])+';border-radius:4px;transition:width .5s"></div>'+
        '</div>'+
        '<span style="font-size:12px;font-weight:700;width:80px;color:var(--danger)">'+formatMoney(cats[cat])+'</span>'+
        '</div>';
    });
    html+='</div>';
    return html;
  }

  function renderExpenseTable(){
    var tbody=$('expTableBody');
    if(!tbody)return;
    var search=($('expSearch')?$('expSearch').value:'').trim().toLowerCase();
    var items=(DB.expenses||[]).slice().reverse().filter(function(e){
      if(!search)return true;
      return e.name.toLowerCase().includes(search)||e.category.toLowerCase().includes(search);
    });
    tbody.innerHTML=items.map(function(e){
      return '<tr><td>'+formatDate(e.date)+'</td><td><strong>'+e.name+'</strong>'+(e.note?'<br><span style="font-size:11px;color:var(--txt2)">'+e.note+'</span>':'')+'</td><td><span class="badge-sm b-red">'+e.category+'</span></td><td style="font-weight:700;color:var(--danger)">'+formatMoney(e.amount)+'</td><td><button style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:14px" onclick="deleteExpense('+e.id+')" title="Excluir"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button></td></tr>';
    }).join('');
    if(items.length===0)tbody.innerHTML='<tr><td colspan="5" class="empty-msg">Nenhuma despesa encontrada</td></tr>';
  }

  window.addExpense=function(){
    var name=$('expName').value.trim();
    var cat=$('expCat').value;
    var amount=parseFloat($('expAmount').value)||0;
    var date=$('expDate').value;
    var note=$('expNote').value.trim();
    if(!name){toast('Informe o nome da despesa!','error');return}
    if(amount<=0){toast('Informe um valor valido!','error');return}
    if(!date){toast('Informe a data!','error');return}
    var expense={
      id:genId('expense'),
      name:name,
      category:cat,
      amount:amount,
      date:new Date(date+'T12:00:00').toISOString(),
      note:note,
      user:currentUser.name
    };
    if(!DB.expenses)DB.expenses=[];
    DB.expenses.push(expense);
    saveDB();
    logActivity('DESPESA','Despesa: '+name+' — '+formatMoney(amount));
    toast('Despesa registrada! '+formatMoney(amount),'success');
    renderExpenses($('mainContent'));
  };

  window.deleteExpense=function(id){
    if(!confirm('Excluir esta despesa?'))return;
    var e=(DB.expenses||[]).find(function(x){return x.id===id});
    DB.expenses=(DB.expenses||[]).filter(function(x){return x.id!==id});
    saveDB();
    logActivity('DESPESA_EXCLUIDA','Despesa excluida: '+(e?e.name:'ID '+id));
    toast('Despesa excluida!','info');
    renderExpenses($('mainContent'));
  };

  // ===== REPORTS =====
  function renderReports(m){
    var activeSales=DB.sales.filter(function(s){return s.status!=='cancelado'});
    var totalRevenue=activeSales.reduce(function(s,v){return s+v.total},0);
    var totalExpenses=(DB.expenses||[]).reduce(function(s,e){return s+e.amount},0);
    var totalProfit=totalRevenue-totalExpenses;
    var avgTicket=activeSales.length>0?totalRevenue/activeSales.length:0;
    var paymentCounts={dinheiro:0,cartao:0,pix:0,debito:0};
    activeSales.forEach(function(s){
      if(s.payments&&s.payments.length>1){
        s.payments.forEach(function(p){if(paymentCounts[p.method]!==undefined)paymentCounts[p.method]++});
      }else if(paymentCounts[s.payment]!==undefined){
        paymentCounts[s.payment]++;
      }else{
        paymentCounts[s.payment]=(paymentCounts[s.payment]||0)+1;
      }
    });
    var topProducts={};
    activeSales.forEach(function(s){s.items.forEach(function(it){topProducts[it.name]=(topProducts[it.name]||0)+it.qty})});
    var sorted=Object.keys(topProducts).sort(function(a,b){return topProducts[b]-topProducts[a]}).slice(0,5);

    var now=new Date();
    var curMonth=now.getMonth();
    var curYear=now.getFullYear();
    var monthNames=['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    var monthSales=activeSales.filter(function(s){var d=new Date(s.date);return d.getMonth()===curMonth&&d.getFullYear()===curYear});
    var monthRev=monthSales.reduce(function(s,v){return s+v.total},0);
    var monthExp=(DB.expenses||[]).filter(function(e){var d=new Date(e.date);return d.getMonth()===curMonth&&d.getFullYear()===curYear});
    var monthExpTotal=monthExp.reduce(function(s,e){return s+e.amount},0);
    var monthProfit=monthRev-monthExpTotal;

    var expByCat={};
    monthExp.forEach(function(e){expByCat[e.category]=(expByCat[e.category]||0)+e.amount});

    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="trending-up" style="width:24px;height:24px;vertical-align:middle"></i> Relatorios</h2><div class="header-actions">'+
      '<button class="btn btn-primary" onclick="exportReportTXT()"><i data-lucide="upload" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Exportar TXT</button>'+
      '</div></div>'+

      '<div class="settings-card" style="margin-bottom:20px">'+
      '<h3><i data-lucide="calendar-days" style="width:18px;height:18px;vertical-align:middle"></i> Resumo Mensal — '+monthNames[curMonth]+' '+curYear+'</h3>'+
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:12px">'+
      '<div style="text-align:center;padding:16px;background:var(--bg3);border-radius:var(--r)"><div style="font-size:11px;color:var(--txt2);margin-bottom:4px">Receitas</div><div style="font-size:20px;font-weight:900;color:var(--success)">'+formatMoney(monthRev)+'</div><div style="font-size:11px;color:var(--txt2)">'+monthSales.length+' vendas</div></div>'+
      '<div style="text-align:center;padding:16px;background:var(--bg3);border-radius:var(--r)"><div style="font-size:11px;color:var(--txt2);margin-bottom:4px">Despesas</div><div style="font-size:20px;font-weight:900;color:var(--danger)">'+formatMoney(monthExpTotal)+'</div><div style="font-size:11px;color:var(--txt2)">'+monthExp.length+' registros</div></div>'+
      '<div style="text-align:center;padding:16px;background:var(--bg3);border-radius:var(--r)"><div style="font-size:11px;color:var(--txt2);margin-bottom:4px">Lucro Liquido</div><div style="font-size:20px;font-weight:900;color:'+(monthProfit>=0?'var(--success)':'var(--danger)')+'">'+formatMoney(monthProfit)+'</div></div>'+
      '<div style="text-align:center;padding:16px;background:var(--bg3);border-radius:var(--r)"><div style="font-size:11px;color:var(--txt2);margin-bottom:4px">Margem</div><div style="font-size:20px;font-weight:900;color:var(--accent)">'+(monthRev>0?((monthProfit/monthRev)*100).toFixed(1):'0')+'%</div></div>'+
      '</div>'+
      (Object.keys(expByCat).length>0?
      '<div style="margin-top:16px"><div style="font-size:13px;font-weight:700;color:var(--txt2);margin-bottom:8px">Despesas por Categoria:</div>'+
      '<div style="display:flex;flex-wrap:wrap;gap:8px">'+
      Object.keys(expByCat).sort(function(a,b){return expByCat[b]-expByCat[a]}).map(function(cat){
        return '<span style="background:rgba(255,71,87,.1);color:var(--danger);padding:4px 10px;border-radius:12px;font-size:12px;font-weight:600">'+cat+': '+formatMoney(expByCat[cat])+'</span>';
      }).join('')+'</div></div>':'')+
      '</div>'+

      '<div class="stats-row">'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="banknote"></i></div><div class="sc-value">'+formatMoney(totalRevenue)+'</div><div class="sc-label">Receita Total</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="banknote"></i></div><div class="sc-value" style="color:var(--danger)">'+formatMoney(totalExpenses)+'</div><div class="sc-label">Despesas Total</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="trending-up"></i></div><div class="sc-value" style="color:'+(totalProfit>=0?'var(--success)':'var(--danger)')+'">'+formatMoney(totalProfit)+'</div><div class="sc-label">Lucro Total</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="bar-chart-3"></i></div><div class="sc-value">'+formatMoney(avgTicket)+'</div><div class="sc-label">Ticket Medio</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="shopping-cart"></i></div><div class="sc-value">'+activeSales.length+'</div><div class="sc-label">Total de Vendas</div></div>'+
      '</div>'+

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">'+
      '<div class="table-wrap"><div class="table-header"><h3>Formas de Pagamento</h3></div>'+
      '<table><thead><tr><th>Metodo</th><th>Quantidade</th><th>%</th></tr></thead><tbody>'+
      Object.keys(paymentCounts).map(function(k){
        var pct=activeSales.length>0?((paymentCounts[k]/activeSales.length)*100).toFixed(1):0;
        var labels={dinheiro:'💵 Dinheiro',cartao:'💳 Credito',pix:'📱 PIX',debito:'🏦 Debito'};
        return '<tr><td>'+labels[k]+'</td><td style="font-weight:700">'+paymentCounts[k]+'</td><td style="color:var(--accent)">'+pct+'%</td></tr>';
      }).join('')+'</tbody></table></div>'+
      '<div class="table-wrap"><div class="table-header"><h3>Top 5 Mais Vendidos</h3></div>'+
      '<table><thead><tr><th>#</th><th>Produto</th><th>Vendidos</th></tr></thead><tbody>'+
      sorted.map(function(name,i){
        return '<tr><td style="font-weight:700;color:var(--accent)">'+(i+1)+'</td><td>'+name+'</td><td style="font-weight:700">'+topProducts[name]+' un</td></tr>';
      }).join('')+'</tbody></table></div></div>';
  }

  // ===== CALCULATOR =====
  function renderCalculator(m){
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="calculator" style="width:24px;height:24px;vertical-align:middle"></i> Calculadora</h2></div>'+
      '<div class="calc-wrap">'+
      '<div class="calc-card">'+
      '<div class="calc-display"><div class="cd-expr" id="calcExpr"></div><div class="cd-result" id="calcResult">0</div></div>'+
      '<div class="calc-grid">'+
      '<button class="clear" onclick="calcClear()">C</button><button class="op" onclick="calcInput(\'(\')">(</button><button class="op" onclick="calcInput(\')\')">)</button><button class="op" onclick="calcInput(\'/\')">÷</button>'+
      '<button onclick="calcInput(\'7\')">7</button><button onclick="calcInput(\'8\')">8</button><button onclick="calcInput(\'9\')">9</button><button class="op" onclick="calcInput(\'*\')">×</button>'+
      '<button onclick="calcInput(\'4\')">4</button><button onclick="calcInput(\'5\')">5</button><button onclick="calcInput(\'6\')">6</button><button class="op" onclick="calcInput(\'-\')">−</button>'+
      '<button onclick="calcInput(\'1\')">1</button><button onclick="calcInput(\'2\')">2</button><button onclick="calcInput(\'3\')">3</button><button class="op" onclick="calcInput(\'+\')">+</button>'+
      '<button onclick="calcInput(\'0\')">0</button><button onclick="calcInput(\'.\')">.</button><button onclick="calcBackspace()">⌫</button><button class="eq" onclick="calcEquals()">=</button>'+
      '</div></div>'+
      '<div style="text-align:center;margin-top:10px;font-size:11px;color:var(--txt2)">Teclado numerico funcional — Numpad e teclas normais</div>'+
      '<div class="calc-history" id="calcHistory"><h4>Historico</h4><div class="empty-msg" style="padding:10px">Nenhum calculo ainda</div></div></div>';
    calcHistory=[];calcExpr='';calcResult='0';
    if(calcKeyHandler)document.removeEventListener('keydown',calcKeyHandler);
    document.addEventListener('keydown',calcKeyHandler);
  }

  var calcKeyHandler=function(e){
    if(currentPage!=='calculator')return;
    var key=e.key;
    var keyMap={
      '0':'0','1':'1','2':'2','3':'3','4':'4',
      '5':'5','6':'6','7':'7','8':'8','9':'9',
      '.':'.',',':'.',
      '+':'+','-':'-','*':'*','/':'/',
      'x':'*','X':'*','×':'*',
      'Enter':'=','=':'=',
      'Backspace':'backspace','Delete':'clear',
      'Escape':'clear','c':'clear','C':'clear',
      '(':'(',')':')'
    };
    if(keyMap[key]!==undefined){
      e.preventDefault();
      var action=keyMap[key];
      if(action==='=')calcEquals();
      else if(action==='clear')calcClear();
      else if(action==='backspace')calcBackspace();
      else calcInput(action);
    }
  };
  window.calcInput=function(v){calcExpr+=v;$('calcExpr').textContent=calcExpr};
  window.calcClear=function(){calcExpr='';calcResult='0';$('calcExpr').textContent='';$('calcResult').textContent='0'};
  window.calcBackspace=function(){calcExpr=calcExpr.slice(0,-1);$('calcExpr').textContent=calcExpr};
  window.calcEquals=function(){
    try{
      var result=Function('"use strict";return ('+calcExpr+')')();
      calcHistory.unshift({expr:calcExpr,result:result});
      calcResult=typeof result==='number'?result.toFixed(2):result;
      $('calcExpr').textContent=calcExpr+' =';
      $('calcResult').textContent=calcResult;
      calcExpr=calcResult.toString();
      renderCalcHistory();
    }catch(e){$('calcResult').textContent='Erro';toast('Expressao invalida!','error')}
  };
  function renderCalcHistory(){
    var el=$('calcHistory');
    if(!el)return;
    if(calcHistory.length===0){el.innerHTML='<h4>Historico</h4><div class="empty-msg" style="padding:10px">Nenhum calculo ainda</div>';return}
    el.innerHTML='<h4>Historico</h4>'+calcHistory.slice(0,10).map(function(h){
      return '<div class="ch-item"><span>'+h.expr+'</span><span>= '+h.result+'</span></div>';
    }).join('');
  }

  // ===== MY ORDERS (CLIENT) =====
  function renderMyOrders(m){
    var mySales=DB.sales.filter(function(s){return s.clientId===currentUser.id&&s.status!=='cancelado'});
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="package" style="width:24px;height:24px;vertical-align:middle"></i> Meus Pedidos</h2></div>'+
      (mySales.length===0?'<div class="empty-msg" style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--rl);padding:60px"><div style="font-size:48px;margin-bottom:12px"><i data-lucide="package" style="width:48px;height:48px"></i></div>Nenhum pedido realizado</div>':
      '<div class="table-wrap"><table><thead><tr><th>#</th><th>Data</th><th>Itens</th><th>Total</th><th>Status</th></tr></thead><tbody>'+
      mySales.map(function(s){return '<tr><td>#'+s.id+'</td><td>'+formatDate(s.date)+'</td><td>'+s.items.length+' itens</td><td style="font-weight:700;color:var(--accent)">'+formatMoney(s.total)+'</td><td><span class="badge-sm b-green">Entregue</span></td></tr>'}).join('')+
      '</tbody></table></div>');
  }

  // ===== 1. ACTIVITY LOG =====
  function renderActivityLog(m){
    var logs=DB.activityLog||[];
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="file-text" style="width:24px;height:24px;vertical-align:middle"></i> Log de Atividades</h2><div class="header-actions">'+
      '<button class="btn btn-danger" onclick="clearActivityLog()">Limpar Log</button>'+
      '</div></div>'+
      '<div class="table-wrap"><div class="table-header"><h3>'+logs.length+' registros</h3>'+
      '<input type="text" class="table-search" id="logSearch" placeholder="Buscar no log..."></div>'+
      '<table><thead><tr><th>Data</th><th>Usuario</th><th>Acao</th><th>Detalhe</th></tr></thead>'+
      '<tbody id="logTableBody"></tbody></table></div>';
    renderLogTable();
    $('logSearch').addEventListener('input',renderLogTable);
  }
  function renderLogTable(){
    var search=($('logSearch')?$('logSearch').value:'').trim().toLowerCase();
    var logs=(DB.activityLog||[]).filter(function(l){
      return l.action.toLowerCase().includes(search)||l.user.toLowerCase().includes(search)||l.detail.toLowerCase().includes(search);
    });
    var actionColors={
      'LOGIN':'b-blue','VENDA':'b-green','PRODUTO_CRIADO':'b-green','PRODUTO_EDITADO':'b-yellow',
      'PRODUTO_EXCLUIDO':'b-red','ESTOQUE_REPOSTO':'b-blue','ESTOQUE_AJUSTADO':'b-yellow',
      'FUNC_CRIADO':'b-green','FUNC_EDITADO':'b-yellow','FUNC_STATUS':'b-purple',
      'USER_CRIADO':'b-green','USER_EDITADO':'b-yellow','USER_STATUS':'b-purple',
      'BACKUP':'b-blue','RESTORE':'b-yellow'
    };
    $('logTableBody').innerHTML=logs.slice(0,200).map(function(l){
      var colorClass=actionColors[l.action]||'b-gray';
      return '<tr><td style="white-space:nowrap;color:var(--txt2);font-size:12px">'+formatDate(l.date)+'</td><td><strong>'+l.user+'</strong></td><td><span class="badge-sm '+colorClass+'">'+l.action.replace(/_/g,' ')+'</span></td><td style="color:var(--txt2)">'+l.detail+'</td></tr>';
    }).join('')||'<tr><td colspan="4" class="empty-msg">Nenhum registro encontrado</td></tr>';
  }
  window.clearActivityLog=function(){
    if(!confirm('Limpar todo o historico de atividades?'))return;
    DB.activityLog=[];saveDB();renderActivityLog($('mainContent'));
    toast('Log limpo!','info');
  };

  // ===== 2. PRICE TAGS =====
  function renderPriceTags(m){
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="tags" style="width:24px;height:24px;vertical-align:middle"></i> Etiquetas de Precos</h2><div class="header-actions">'+
      '<button class="btn btn-ghost" onclick="openPromoModal()"><i data-lucide="tags" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Gerenciar Promocoes</button>'+
      '<button class="btn btn-primary" onclick="printPriceTags()"><i data-lucide="printer" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Imprimir Selecionados</button>'+
      '</div></div>'+
      '<div style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap">'+
      '<input type="text" class="table-search" id="tagSearch" placeholder="Buscar produto..." style="flex:1;min-width:200px">'+
      '<select class="sort-select" id="tagCatFilter" style="padding:8px 14px;border-radius:var(--r);border:1px solid var(--border);background:var(--bg2);color:var(--txt);font-family:inherit;font-size:13px"><option value="Todos">Todas categorias</option></select>'+
      '<button class="btn btn-ghost" onclick="selectAllTags()">Selecionar Todos</button>'+
      '<button class="btn btn-ghost" onclick="deselectAllTags()">Desmarcar Todos</button>'+
      '</div>'+
      '<div class="settings-card" style="margin-bottom:16px">'+
      '<h3 style="margin-bottom:12px"><i data-lucide="settings-2" style="width:18px;height:18px;vertical-align:middle"></i> Modelo da Etiqueta</h3>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px" id="tagTemplateBtns">'+
      '<button class="btn btn-sm" data-tpl="simple" onclick="setTagTemplate(\'simple\')" style="border:2px solid var(--accent);background:var(--accent);color:#fff">Simples</button>'+
      '<button class="btn btn-sm" data-tpl="detailed" onclick="setTagTemplate(\'detailed\')">Detalhada</button>'+
      '<button class="btn btn-sm" data-tpl="compact" onclick="setTagTemplate(\'compact\')">Compacta</button>'+
      '<button class="btn btn-sm" data-tpl="full" onclick="setTagTemplate(\'full\')">Completa</button>'+
      '<button class="btn btn-sm" data-tpl="shelf" onclick="setTagTemplate(\'shelf\')">Prateleira</button>'+
      '<button class="btn btn-sm" data-tpl="promo" onclick="setTagTemplate(\'promo\')">Promocao</button>'+
      '</div>'+
      '<h3 style="margin-bottom:8px;font-size:13px;color:var(--txt2)">Campos Extras</h3>'+
      '<div style="display:flex;gap:12px;flex-wrap:wrap" id="tagFieldOpts">'+
      '<label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="checkbox" id="tfBarcode" checked onchange="renderPriceTagGrid()"> Codigo de Barras</label>'+
      '<label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="checkbox" id="tfCategory" onchange="renderPriceTagGrid()"> Categoria</label>'+
      '<label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="checkbox" id="tfSupplier" onchange="renderPriceTagGrid()"> Fornecedor</label>'+
      '<label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="checkbox" id="tfUnit" onchange="renderPriceTagGrid()"> Unidade</label>'+
      '<label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="checkbox" id="tfStock" onchange="renderPriceTagGrid()"> Estoque</label>'+
      '<label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="checkbox" id="tfExpiry" onchange="renderPriceTagGrid()"> Validade</label>'+
      '<label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="checkbox" id="tfDescription" onchange="renderPriceTagGrid()"> Descricao</label>'+
      '<label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="checkbox" id="tfCost" onchange="renderPriceTagGrid()"> Custo</label>'+
      '<label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="checkbox" id="tfMargin" onchange="renderPriceTagGrid()"> Margem</label>'+
      '<label style="display:flex;align-items:center;gap:4px;font-size:12px;cursor:pointer"><input type="checkbox" id="tfCode" onchange="renderPriceTagGrid()"> Cod. Produto</label>'+
      '</div></div>'+
      '<div id="priceTagGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px"></div>'+
      '<div id="printArea" style="display:none"></div>';
    var cats=[...new Set(DB.products.map(function(p){return p.cat}))];
    var sel=$('tagCatFilter');
    cats.forEach(function(c){var o=document.createElement('option');o.value=c;o.textContent=c;sel.appendChild(o)});
    sel.addEventListener('change',renderPriceTagGrid);
    $('tagSearch').addEventListener('input',renderPriceTagGrid);
    window._tagTemplate=window._tagTemplate||'simple';
    renderPriceTagGrid();
  }

  window.setTagTemplate=function(tpl){
    window._tagTemplate=tpl;
    document.querySelectorAll('#tagTemplateBtns .btn').forEach(function(b){
      if(b.dataset.tpl===tpl){b.style.border='2px solid var(--accent)';b.style.background='var(--accent)';b.style.color='#fff'}
      else{b.style.border='';b.style.background='';b.style.color=''}
    });
    renderPriceTagGrid();
  };

  function getTagFields(){
    return{
      barcode:$('tfBarcode')&&$('tfBarcode').checked,
      category:$('tfCategory')&&$('tfCategory').checked,
      supplier:$('tfSupplier')&&$('tfSupplier').checked,
      unit:$('tfUnit')&&$('tfUnit').checked,
      stock:$('tfStock')&&$('tfStock').checked,
      expiry:$('tfExpiry')&&$('tfExpiry').checked,
      description:$('tfDescription')&&$('tfDescription').checked,
      cost:$('tfCost')&&$('tfCost').checked,
      margin:$('tfMargin')&&$('tfMargin').checked,
      code:$('tfCode')&&$('tfCode').checked
    };
  }

  function buildTagPreview(p,tpl,fields){
    var company=getCompanyData()?(getCompanyData().fantasyName||getCompanyData().name||'PETSHOP PRADO'):'PETSHOP PRADO';
    var hasPromo=p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price;
    var sup=DB.suppliers.find(function(s){return s.id===p.supplierId});
    var expiry=getExpiryStatus(p);
    var margin=p.cost>0?(((p.price-p.cost)/p.cost)*100).toFixed(0):'0';
    var borderColor=hasPromo?'#2ed573':'#ccc';
    var extraFields='';
    if(fields.category&&p.cat)extraFields+='<div style="font-size:9px;color:#888">Cat: '+p.cat+'</div>';
    if(fields.supplier&&sup)extraFields+='<div style="font-size:9px;color:#888">Forn: '+sup.name+'</div>';
    if(fields.unit&&p.unit)extraFields+='<div style="font-size:9px;color:#888">Un: '+p.unit+'</div>';
    if(fields.stock)extraFields+='<div style="font-size:9px;color:#888">Estoque: '+p.stock+(p.unit?' '+p.unit:'')+'</div>';
    if(fields.expiry&&p.expiryDate){
      var exp=getExpiryStatus(p);
      extraFields+='<div style="font-size:9px;color:'+(exp?exp.color:'#888')+'">Validade: '+new Date(p.expiryDate).toLocaleDateString('pt-BR')+'</div>';
    }
    if(fields.description&&p.description)extraFields+='<div style="font-size:8px;color:#999;margin-top:2px">'+p.description.substring(0,60)+'</div>';
    if(fields.cost&&p.cost>0)extraFields+='<div style="font-size:9px;color:#888">Custo: R$ '+p.cost.toFixed(2).replace('.',',')+'</div>';
    if(fields.margin)extraFields+='<div style="font-size:9px;color:#888">Margem: '+margin+'%</div>';
    if(fields.code&&p.id)extraFields+='<div style="font-size:9px;color:#888">Cod: #'+p.id+'</div>';

    if(tpl==='simple'){
      return '<div style="width:220px;border:2px dashed '+borderColor+';border-radius:8px;padding:10px;text-align:center;font-family:Courier New,monospace;background:#fff;color:#000">'+
      '<div style="font-size:9px;color:#666">'+company+'</div>'+
      '<div style="font-size:11px;font-weight:700;margin:4px 0">'+p.name+'</div>'+
      (hasPromo?'<div style="font-size:12px;color:#999;text-decoration:line-through">R$ '+p.price.toFixed(2).replace('.',',')+'</div><div style="font-size:22px;font-weight:900;color:#2ed573">R$ '+p.promoPrice.toFixed(2).replace('.',',')+'</div><div style="font-size:9px;color:#2ed573;font-weight:700">★ PROMO ('+((1-p.promoPrice/p.price)*100).toFixed(0)+'% OFF) ★</div>':
        '<div style="font-size:22px;font-weight:900;color:#d32f2f">R$ '+p.price.toFixed(2).replace('.',',')+'</div>')+
      (fields.barcode?'<div style="font-size:8px;color:#999;margin-top:2px">||| '+(p.barcode||'')+' |||</div>':'')+
      extraFields+
      '</div>';
    }
    if(tpl==='detailed'){
      return '<div style="width:220px;border:2px solid '+borderColor+';border-radius:8px;padding:12px;font-family:Courier New,monospace;background:#fff;color:#000">'+
      '<div style="text-align:center;border-bottom:1px solid #eee;padding-bottom:6px;margin-bottom:6px"><div style="font-size:8px;color:#666">'+company+'</div>'+
      '<div style="font-size:12px;font-weight:700">'+p.name+'</div>'+
      (p.cat?'<div style="font-size:9px;color:#888">'+p.cat+'</div>':'')+'</div>'+
      (hasPromo?'<div style="text-align:center"><span style="font-size:11px;color:#999;text-decoration:line-through">R$ '+p.price.toFixed(2).replace('.',',')+'</span> → <span style="font-size:20px;font-weight:900;color:#2ed573">R$ '+p.promoPrice.toFixed(2).replace('.',',')+'</span></div>':
        '<div style="text-align:center;font-size:24px;font-weight:900;color:#d32f2f">R$ '+p.price.toFixed(2).replace('.',',')+'</div>')+
      '<div style="margin-top:6px;font-size:9px;color:#666">'+extraFields+'</div>'+
      (fields.barcode?'<div style="text-align:center;margin-top:4px;font-size:8px;color:#999">||| '+(p.barcode||'')+' |||</div>':'')+
      '</div>';
    }
    if(tpl==='compact'){
      return '<div style="width:160px;border:1px solid '+borderColor+';border-radius:4px;padding:6px;font-family:Courier New,monospace;background:#fff;color:#000;display:flex;align-items:center;gap:6px">'+
      '<span style="font-size:18px">'+p.emoji+'</span>'+
      '<div style="flex:1;min-width:0"><div style="font-size:10px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+p.name+'</div>'+
      (hasPromo?'<div style="font-size:9px;color:#999;text-decoration:line-through">R$ '+p.price.toFixed(2).replace('.',',')+'</div><div style="font-size:14px;font-weight:900;color:#2ed573">R$ '+p.promoPrice.toFixed(2).replace('.',',')+'</div>':
        '<div style="font-size:14px;font-weight:900;color:#d32f2f">R$ '+p.price.toFixed(2).replace('.',',')+'</div>')+
      (fields.barcode?'<div style="font-size:7px;color:#aaa">'+(p.barcode||'')+'</div>':'')+
      '</div></div>';
    }
    if(tpl==='full'){
      return '<div style="width:240px;border:2px solid '+borderColor+';border-radius:10px;padding:14px;font-family:Courier New,monospace;background:#fff;color:#000">'+
      '<div style="text-align:center;padding-bottom:8px;border-bottom:2px dashed #ddd;margin-bottom:8px">'+
      '<div style="font-size:10px;color:#666;font-weight:700">'+company+'</div>'+
      '<div style="font-size:14px;font-weight:700;margin:4px 0">'+p.emoji+' '+p.name+'</div>'+
      (p.cat?'<div style="font-size:9px;color:#888;background:#f5f5f5;display:inline-block;padding:2px 8px;border-radius:4px">'+p.cat+'</div>':'')+
      '</div>'+
      (hasPromo?'<div style="text-align:center"><div style="font-size:12px;color:#999;text-decoration:line-through">R$ '+p.price.toFixed(2).replace('.',',')+'</div><div style="font-size:28px;font-weight:900;color:#2ed573">R$ '+p.promoPrice.toFixed(2).replace('.',',')+'</div><div style="font-size:10px;color:#2ed573;font-weight:700;background:#e8fbe8;display:inline-block;padding:2px 8px;border-radius:4px">★ PROMOCAO ('+((1-p.promoPrice/p.price)*100).toFixed(0)+'% OFF) ★</div></div>':
        '<div style="text-align:center"><div style="font-size:28px;font-weight:900;color:#d32f2f">R$ '+p.price.toFixed(2).replace('.',',')+'</div></div>')+
      '<div style="margin-top:8px;font-size:9px;color:#666;line-height:1.4">'+extraFields+'</div>'+
      (fields.barcode?'<div style="text-align:center;margin-top:6px;padding-top:6px;border-top:1px dashed #ddd;font-size:8px;color:#999">||| '+(p.barcode||'')+' |||</div>':'')+
      '</div>';
    }
    if(tpl==='shelf'){
      return '<div style="width:180px;border:3px solid #333;border-radius:4px;padding:8px;font-family:Arial,sans-serif;background:#fff;color:#000;text-align:center">'+
      '<div style="font-size:9px;color:#666;font-weight:700;letter-spacing:1px">'+company+'</div>'+
      '<div style="font-size:11px;font-weight:700;margin:4px 0;border-bottom:2px solid #333;padding-bottom:4px">'+p.name+'</div>'+
      (hasPromo?'<div style="font-size:10px;color:#999;text-decoration:line-through">R$ '+p.price.toFixed(2).replace('.',',')+'</div><div style="font-size:32px;font-weight:900;color:#2ed573;line-height:1">R$ '+p.promoPrice.toFixed(2).replace('.',',')+'</div><div style="font-size:10px;color:#fff;background:#2ed573;display:inline-block;padding:2px 8px;border-radius:3px;font-weight:700">PROMO</div>':
        '<div style="font-size:32px;font-weight:900;color:#000;line-height:1">R$ '+p.price.toFixed(2).replace('.',',')+'</div>')+
      (fields.barcode?'<div style="font-size:7px;color:#999;margin-top:4px">'+(p.barcode||'')+'</div>':'')+
      '</div>';
    }
    if(tpl==='promo'){
      if(!hasPromo){
        return '<div style="width:200px;border:2px dashed #ccc;border-radius:8px;padding:12px;text-align:center;font-family:Courier New,monospace;background:#fff;color:#000;opacity:0.6">'+
        '<div style="font-size:10px;color:#999">Sem promocao ativa</div>'+
        '<div style="font-size:11px;font-weight:700;margin:4px 0">'+p.name+'</div>'+
        '<div style="font-size:14px;color:#666">R$ '+p.price.toFixed(2).replace('.',',')+'</div></div>';
      }
      var pct=((1-p.promoPrice/p.price)*100).toFixed(0);
      return '<div style="width:200px;border:3px solid #ff4757;border-radius:10px;padding:12px;text-align:center;font-family:Arial,sans-serif;background:linear-gradient(135deg,#fff5f5,#fff);color:#000;position:relative;overflow:hidden">'+
      '<div style="position:absolute;top:-10px;right:-10px;background:#ff4757;color:#fff;font-size:20px;font-weight:900;width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;transform:rotate(15deg)">'+pct+'%</div>'+
      '<div style="font-size:8px;color:#ff4757;font-weight:700;letter-spacing:2px">★ PROMOCAO ★</div>'+
      '<div style="font-size:12px;font-weight:700;margin:6px 0">'+p.name+'</div>'+
      '<div style="font-size:10px;color:#999;text-decoration:line-through">R$ '+p.price.toFixed(2).replace('.',',')+'</div>'+
      '<div style="font-size:28px;font-weight:900;color:#ff4757">R$ '+p.promoPrice.toFixed(2).replace('.',',')+'</div>'+
      '<div style="font-size:8px;color:#666;margin-top:4px">'+company+'</div>'+
      (fields.barcode?'<div style="font-size:7px;color:#bbb;margin-top:2px">'+(p.barcode||'')+'</div>':'')+
      '</div>';
    }
    return '';
  }

  function renderPriceTagGrid(){
    var search=(($('tagSearch')?$('tagSearch').value:'')||'').trim().toLowerCase();
    var cat=(($('tagCatFilter')?$('tagCatFilter').value:'')||'Todos');
    var tpl=window._tagTemplate||'simple';
    var fields=getTagFields();
    var items=DB.products.filter(function(p){
      return(cat==='Todos'||p.cat===cat)&&(p.name.toLowerCase().includes(search)||(p.barcode&&p.barcode.includes(search)));
    });
    var grid=$('priceTagGrid');
    grid.innerHTML=items.map(function(p){
      var hasPromo=p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price;
      return '<div style="background:var(--bg2);border:1px solid '+(hasPromo?'rgba(46,213,115,.4)':'var(--border)')+';border-radius:var(--r);padding:12px;cursor:pointer;transition:var(--tr)" onclick="toggleTagSelect(this)" data-id="'+p.id+'">'+
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'+
      '<input type="checkbox" class="tag-check" data-id="'+p.id+'" style="accent-color:var(--accent);width:16px;height:16px">'+
      '<span style="font-size:20px">'+p.emoji+'</span>'+
      '<strong style="font-size:13px">'+p.name+'</strong>'+
      (hasPromo?'<span class="badge-sm b-red" style="margin-left:4px">PROMO</span>':'')+
      '<span class="badge-sm b-blue" style="margin-left:auto;font-size:9px">'+tpl.toUpperCase()+'</span></div>'+
      buildTagPreview(p,tpl,fields)+
      '</div>';
    }).join('');
  }
  window.toggleTagSelect=function(el){var cb=el.querySelector('.tag-check');cb.checked=!cb.checked;el.style.borderColor=cb.checked?'var(--accent)':el.dataset.id&&DB.products.find(function(p){return p.id===parseInt(el.dataset.id)&&p.promoActive})?'rgba(46,213,115,.4)':'var(--border)'};
  window.selectAllTags=function(){document.querySelectorAll('.tag-check').forEach(function(cb){cb.checked=true;var card=cb.closest('[data-id]');if(card)card.style.borderColor='var(--accent)'})};
  window.deselectAllTags=function(){document.querySelectorAll('.tag-check').forEach(function(cb){cb.checked=false;var card=cb.closest('[data-id]');if(card)card.style.borderColor='var(--border)'})};

  // ===== PROMO MODAL =====
  window.openPromoModal=function(){
    if(!hasFuncPermission('managePromos')){toast('Sem permissao para gerenciar promocoes!','error');return}
    var items=DB.products.filter(function(p){return p.promoActive&&p.promoPrice>0});
    var listHTML=items.length>0?'<div style="margin-bottom:16px"><strong style="font-size:13px;color:var(--accent)">Promocoes Ativas ('+items.length+')</strong>'+
      items.map(function(p){
        var pct=((1-p.promoPrice/p.price)*100).toFixed(0);
        return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">'+
        '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:20px">'+p.emoji+'</span><div><strong style="font-size:13px">'+p.name+'</strong><br><span style="font-size:11px;color:var(--txt2)">De <s>R$ '+p.price.toFixed(2).replace('.',',')+'</s> por <strong style="color:#2ed573">R$ '+p.promoPrice.toFixed(2).replace('.',',')+'</strong> ('+pct+'% off)</span></div></div>'+
        '<button class="btn btn-danger" style="padding:4px 10px;font-size:11px" onclick="removePromo('+p.id+')">Remover</button></div>';
      }).join('')+'</div>':'<div style="padding:16px;text-align:center;color:var(--txt2);font-size:13px;margin-bottom:16px">Nenhuma promocao ativa</div>';

    var allProductsHTML='<strong style="font-size:13px">Adicionar Promocao</strong>'+
      '<div style="margin-top:8px;max-height:300px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--r)">'+
      DB.products.filter(function(p){return!p.promoActive||!p.promoPrice||p.promoPrice>=p.price}).map(function(p){
        return '<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border);cursor:pointer" onclick="setPromoForProduct('+p.id+')">'+
        '<span style="font-size:18px">'+p.emoji+'</span>'+
        '<span style="flex:1;font-size:13px">'+p.name+'</span>'+
        '<span style="font-size:12px;color:var(--txt2)">R$ '+p.price.toFixed(2).replace('.',',')+'</span>'+
        '<button class="btn btn-primary" style="padding:4px 10px;font-size:11px">+ Promo</button></div>';
      }).join('')+'</div>';

    openModal('Gerenciar Promocoes',listHTML+allProductsHTML,'<button class="btn btn-ghost" onclick="closeModal()">Fechar</button>');
  };

  window.setPromoForProduct=function(id){
    var p=DB.products.find(function(x){return x.id===id});
    if(!p)return;
    var body=
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;padding:12px;background:var(--bg3);border-radius:var(--r)">'+
      '<span style="font-size:28px">'+p.emoji+'</span>'+
      '<div><strong style="font-size:15px">'+p.name+'</strong><br><span style="font-size:13px;color:var(--txt2)">Preco atual: <strong style="color:var(--accent)">R$ '+p.price.toFixed(2).replace('.',',')+'</strong></span></div></div>'+
      '<label>Preco Promocional (R$)</label>'+
      '<input type="number" step="0.01" id="promoPrice" value="'+(p.promoPrice||'')+'" placeholder="Ex: 19.90">'+
      '<div style="font-size:11px;color:var(--txt2);margin-top:4px">Insira um valor menor que R$ '+p.price.toFixed(2).replace('.',',')+' para ativar a promoção</div>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="savePromo('+id+')">Salvar Promocao</button>';
    openModal('Definir Promocao',body,foot);
  };

  window.savePromo=function(id){
    var p=DB.products.find(function(x){return x.id===id});
    if(!p)return;
    var price=parseFloat($('promoPrice').value);
    if(isNaN(price)||price<=0){toast('Preco invalido!','error');return}
    if(price>=p.price){toast('Preco promocional deve ser menor que o preco atual!','error');return}
    p.promoPrice=price;
    p.promoActive=true;
    logActivity('PROMO_CRIADA',p.name+' — de '+formatMoney(p.price)+' por '+formatMoney(price));
    saveDB();closeModal();renderPriceTagGrid();
    toast('Promocao criada para '+p.name+'!','success');
  };

  window.removePromo=function(id){
    var p=DB.products.find(function(x){return x.id===id});
    if(!p)return;
    p.promoActive=false;
    p.promoPrice=0;
    logActivity('PROMO_REMOVIDA',p.name);
    saveDB();renderPriceTagGrid();
    toast('Promocao removida de '+p.name,'info');
    openPromoModal();
  };

  window.printPriceTags=function(){
    if(!hasFuncPermission('printLabels')){toast('Sem permissao para imprimir etiquetas!','error');return}
    var selected=[];
    document.querySelectorAll('.tag-check:checked').forEach(function(cb){
      var p=DB.products.find(function(x){return x.id===parseInt(cb.dataset.id)});
      if(p)selected.push(p);
    });
    if(selected.length===0){toast('Selecione pelo menos 1 produto!','error');return}
    var tpl=window._tagTemplate||'simple';
    var fields=getTagFields();
    var tagsHTML=selected.map(function(p){
      return buildTagPreview(p,tpl,fields).replace('display:inline-block;','').replace('margin:8px;','padding:8px;');
    }).join('');
    var tplLabels={simple:'Simples',detailed:'Detalhada',compact:'Compacta',full:'Completa',shelf:'Prateleira',promo:'Promocao'};
    smartPrint(tagsHTML,{title:'Etiquetas — '+tplLabels[tpl],width:80,fontSize:12});
  };

  // ===== 4. BACKUP / RESTORE =====
  function renderBackup(m){
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="refresh-cw" style="width:24px;height:24px;vertical-align:middle"></i> Backup / Restore</h2></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card" style="cursor:pointer" onclick="exportBackup()">'+
      '<div class="sc-icon"><i data-lucide="download"></i></div><div class="sc-value" style="font-size:20px">Exportar Tudo</div>'+
      '<div class="sc-label">Baixar todos os dados como arquivo JSON</div></div>'+
      '<div class="stat-card" style="cursor:pointer" onclick="importBackupClick()">'+
      '<div class="sc-icon"><i data-lucide="upload"></i></div><div class="sc-value" style="font-size:20px">Importar Tudo</div>'+
      '<div class="sc-label">Restaurar todos os dados de um arquivo JSON</div></div>'+
      '<div class="stat-card" style="cursor:pointer" onclick="createServerBackup()">'+
      '<div class="sc-icon"><i data-lucide="hard-drive"></i></div><div class="sc-value" style="font-size:20px">Backup no Servidor</div>'+
      '<div class="sc-label">Criar backup completo dos dados no servidor</div></div>'+
      '</div>'+
      '<div class="settings-card" style="margin-top:24px">'+
      '<h3><i data-lucide="package" style="width:18px;height:18px;vertical-align:middle"></i> Backup de Estoque</h3>'+
      '<p style="font-size:13px;color:var(--txt2);margin-bottom:16px">Exportar ou importar apenas os produtos/estoque, sem afetar outros dados.</p>'+
      '<div class="stats-row" style="margin:0">'+
      '<div class="stat-card" style="cursor:pointer;margin:0" onclick="exportStockBackup()">'+
      '<div class="sc-icon"><i data-lucide="download"></i></div><div class="sc-value" style="font-size:16px">Exportar Estoque</div>'+
      '<div class="sc-label">Baixar produtos como JSON</div></div>'+
      '<div class="stat-card" style="cursor:pointer;margin:0" onclick="importStockBackupClick()">'+
      '<div class="sc-icon"><i data-lucide="upload"></i></div><div class="sc-value" style="font-size:16px">Importar Estoque</div>'+
      '<div class="sc-label">Restaurar produtos de um arquivo</div></div>'+
      '<div class="stat-card" style="cursor:pointer;margin:0" onclick="createStockServerBackup()">'+
      '<div class="sc-icon"><i data-lucide="hard-drive"></i></div><div class="sc-value" style="font-size:16px">Backup Estoque no Servidor</div>'+
      '<div class="sc-label">Salvar estoque no servidor</div></div>'+
      '</div></div>'+
      '<div class="table-wrap" style="margin-top:24px"><div class="table-header"><h3>Resumo dos Dados</h3></div>'+
      '<table><tbody>'+
      '<tr><td><strong>Produtos</strong></td><td style="color:var(--accent);font-weight:700">'+DB.products.length+'</td></tr>'+
      '<tr><td><strong>Funcionarios</strong></td><td style="color:var(--accent);font-weight:700">'+DB.employees.length+'</td></tr>'+
      '<tr><td><strong>Usuarios</strong></td><td style="color:var(--accent);font-weight:700">'+DB.users.length+'</td></tr>'+
      '<tr><td><strong>Clientes</strong></td><td style="color:var(--accent);font-weight:700">'+DB.clients.length+'</td></tr>'+
      '<tr><td><strong>Banho & Tosa</strong></td><td style="color:var(--accent);font-weight:700">'+DB.bathGrooming.length+'</td></tr>'+
      '<tr><td><strong>Vendas</strong></td><td style="color:var(--accent);font-weight:700">'+DB.sales.length+'</td></tr>'+
      '<tr><td><strong>Logs de Atividade</strong></td><td style="color:var(--accent);font-weight:700">'+(DB.activityLog||[]).length+'</td></tr>'+
      '<tr><td><strong>Tamanho dos Dados</strong></td><td style="color:var(--accent);font-weight:700">'+(new Blob([JSON.stringify(DB)]).size/1024).toFixed(1)+' KB</td></tr>'+
      '</tbody></table></div>'+
      '<div class="table-wrap" style="margin-top:24px"><div class="table-header"><h3>Backups Completos do Servidor</h3><button class="btn btn-sm" onclick="loadServerBackups()"><i data-lucide="refresh-cw" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Atualizar</button></div>'+
      '<div id="serverBackupsList"><div class="empty-msg">Carregando backups...</div></div></div>'+
      '<div class="table-wrap" style="margin-top:24px"><div class="table-header"><h3>Backups de Estoque do Servidor</h3><button class="btn btn-sm" onclick="loadStockServerBackups()"><i data-lucide="refresh-cw" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Atualizar</button></div>'+
      '<div id="stockBackupsList"><div class="empty-msg">Carregando backups de estoque...</div></div></div>'+
      '<div class="settings-card" style="margin-top:24px">'+
      '<h3><i data-lucide="truck" style="width:18px;height:18px;vertical-align:middle"></i> Backup de Fornecedores e Pedidos</h3>'+
      '<p style="font-size:13px;color:var(--txt2);margin-bottom:16px">Exportar ou importar apenas fornecedores e pedidos ao fornecedor.</p>'+
      '<div class="stats-row" style="margin:0">'+
      '<div class="stat-card" style="cursor:pointer;margin:0" onclick="exportSupplierBackup()">'+
      '<div class="sc-icon"><i data-lucide="download"></i></div><div class="sc-value" style="font-size:16px">Exportar Fornecedores</div>'+
      '<div class="sc-label">Baixar fornecedores e pedidos como JSON</div></div>'+
      '<div class="stat-card" style="cursor:pointer;margin:0" onclick="importSupplierBackupClick()">'+
      '<div class="sc-icon"><i data-lucide="upload"></i></div><div class="sc-value" style="font-size:16px">Importar Fornecedores</div>'+
      '<div class="sc-label">Restaurar de um arquivo JSON</div></div>'+
      '<div class="stat-card" style="cursor:pointer;margin:0" onclick="createSupplierServerBackup()">'+
      '<div class="sc-icon"><i data-lucide="hard-drive"></i></div><div class="sc-value" style="font-size:16px">Backup no Servidor</div>'+
      '<div class="sc-label">Salvar fornecedores no servidor</div></div>'+
      '</div></div>'+
      '<div class="table-wrap" style="margin-top:24px"><div class="table-header"><h3>Backups de Fornecedores do Servidor</h3><button class="btn btn-sm" onclick="loadSupplierServerBackups()"><i data-lucide="refresh-cw" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Atualizar</button></div>'+
      '<div id="supplierBackupsList"><div class="empty-msg">Carregando backups de fornecedores...</div></div></div>'+
      '<input type="file" id="backupFileInput" accept=".json" style="display:none">'+
      '<input type="file" id="stockBackupFileInput" accept=".json" style="display:none">'+
      '<input type="file" id="supplierBackupFileInput" accept=".json" style="display:none">';
    $('backupFileInput').addEventListener('change',doImportBackup);
    $('stockBackupFileInput').addEventListener('change',doImportStockBackup);
    $('supplierBackupFileInput').addEventListener('change',doImportSupplierBackup);
    loadServerBackups();
    loadStockServerBackups();
    loadSupplierServerBackups();
  }

  window.loadServerBackups=function(){
    var el=$('serverBackupsList');
    if(!el)return;
    fetch('/api/backups',{headers:{'x-auth-token':getAuthToken()}})
    .then(function(r){return r.json()})
    .then(function(data){
      if(!data.backups||data.backups.length===0){
        el.innerHTML='<div class="empty-msg">Nenhum backup encontrado no servidor</div>';
        return;
      }
      var html='<div class="table-wrap"><table><thead><tr><th>Data</th><th>Tamanho</th><th>Tipo</th><th>Acoes</th></tr></thead><tbody>';
      data.backups.forEach(function(b){
        var sizeKB=(b.size/1024).toFixed(1);
        var isManual=b.filename.indexOf('manual_')!==-1;
        var dateStr=b.date||'';
        var timeStr='';
        if(isManual&&b.modified){
          var d=new Date(b.modified);
          timeStr=' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
        }
        html+='<tr>'+
          '<td><strong>'+dateStr+'</strong>'+timeStr+'</td>'+
          '<td>'+sizeKB+' KB</td>'+
          '<td><span class="badge-sm '+(isManual?'b-purple':'b-blue')+'">'+(isManual?'Manual':'Automatico')+'</span></td>'+
          '<td>'+
            '<button class="btn btn-sm" onclick="downloadServerBackup(\''+b.filename+'\')" title="Baixar"><i data-lucide="download" style="width:14px;height:14px"></i></button> '+
            '<button class="btn btn-sm" onclick="restoreServerBackup(\''+b.filename+'\')" title="Restaurar"><i data-lucide="rotate-ccw" style="width:14px;height:14px"></i></button> '+
            '<button class="btn btn-sm btn-danger" onclick="deleteServerBackup(\''+b.filename+'\')" title="Deletar"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>'+
          '</td></tr>';
      });
      html+='</tbody></table></div>';
      el.innerHTML=html;
      if(typeof lucide!=='undefined')lucide.createIcons();
    }).catch(function(){
      el.innerHTML='<div class="empty-msg">Erro ao carregar backups do servidor</div>';
    });
  };

  window.createServerBackup=function(){
    if(!hasFuncPermission('serverBackup')){toast('Sem permissao para criar backup no servidor!','error');return}
    if(!confirm('Criar backup dos dados atuais no servidor?'))return;
    fetch('/api/backups/create',{method:'POST',headers:{'Content-Type':'application/json','x-auth-token':getAuthToken()}})
    .then(function(r){return r.json()})
    .then(function(data){
      if(data.ok){
        logActivity('BACKUP','Backup manual criado no servidor: '+data.filename);
        toast('Backup criado com sucesso!','success');
        loadServerBackups();
      }else{
        toast(data.error||'Erro ao criar backup','error');
      }
    }).catch(function(){toast('Erro ao conectar com o servidor','error');});
  };

  window.downloadServerBackup=function(filename){
    fetch('/api/backups/download/'+filename,{headers:{'x-auth-token':getAuthToken()}})
    .then(function(r){
      if(!r.ok)throw new Error('Erro ao baixar');
      return r.blob();
    })
    .then(function(blob){
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a');
      a.href=url;a.download=filename;
      document.body.appendChild(a);a.click();a.remove();
      URL.revokeObjectURL(url);
      toast('Download concluido','success');
    }).catch(function(){toast('Erro ao baixar backup','error');});
  };

  window.restoreServerBackup=function(filename){
    if(!hasFuncPermission('restoreBackup')){toast('Sem permissao para restaurar backup!','error');return}
    if(!confirm('Isso SUBSTITUIRA todos os dados atuais pelo backup "'+filename+'".\n\nTem certeza?'))return;
    fetch('/api/backups/restore/'+filename,{method:'POST',headers:{'Content-Type':'application/json','x-auth-token':getAuthToken()}})
    .then(function(r){return r.json()})
    .then(function(data){
      if(data.ok){
        logActivity('RESTORE','Backup restaurado do servidor: '+filename);
        loadFromServer(function(ok){
          if(ok){renderBackup($('mainContent'));toast('Backup restaurado com sucesso!','success');}
          else{toast('Restaurado, mas erro ao recarregar dados','error');}
        });
      }else{
        toast(data.error||'Erro ao restaurar backup','error');
      }
    }).catch(function(){toast('Erro ao conectar com o servidor','error');});
  };

  window.deleteServerBackup=function(filename){
    if(!hasFuncPermission('deleteBackup')){toast('Sem permissao para deletar backup!','error');return}
    if(!confirm('Deletar o backup "'+filename+'"?\n\nEsta acao nao pode ser desfeita.'))return;
    fetch('/api/backups/delete/'+filename,{method:'DELETE',headers:{'x-auth-token':getAuthToken()}})
    .then(function(r){return r.json()})
    .then(function(data){
      if(data.ok){
        logActivity('BACKUP','Backup deletado do servidor: '+filename);
        toast('Backup deletado!','info');
        loadServerBackups();
      }else{
        toast(data.error||'Erro ao deletar backup','error');
      }
    }).catch(function(){toast('Erro ao conectar com o servidor','error');});
  };

  window.exportBackup=function(){
    if(!hasFuncPermission('exportBackup')){toast('Sem permissao para exportar backup!','error');return}
    var blob=new Blob([JSON.stringify(DB,null,2)],{type:'application/json'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;a.download='petshopprado-backup-'+new Date().toISOString().slice(0,10)+'.json';
    a.click();URL.revokeObjectURL(url);
    logActivity('BACKUP','Backup exportado — '+(new Blob([JSON.stringify(DB)]).size/1024).toFixed(1)+' KB');
    toast('Backup exportado com sucesso!','success');
  };
  window.importBackupClick=function(){if(!hasFuncPermission('importBackup')){toast('Sem permissao para importar backup!','error');return}$('backupFileInput').click()};
  function doImportBackup(e){
    var file=e.target.files[0];if(!file)return;
    var reader=new FileReader();
    reader.onload=function(ev){
      try{
        var data=JSON.parse(ev.target.result);
        if(!data.products||!data.users){toast('Arquivo de backup invalido!','error');return}
        if(!confirm('Isso SUBSTITUIRA todos os dados atuais. Continuar?'))return;
        DB=data;
        if(!DB.activityLog)DB.activityLog=[];
        saveDB();
        logActivity('RESTORE','Backup restaurado do arquivo: '+file.name);
        renderBackup($('mainContent'));
        toast('Backup restaurado com sucesso!','success');
      }catch(err){toast('Erro ao ler arquivo!','error');}
    };
    reader.readAsText(file);
    e.target.value='';
  }

  // ===== STOCK BACKUP =====
  window.exportStockBackup=function(){
    if(!hasFuncPermission('exportStock')){toast('Sem permissao para exportar estoque!','error');return}
    var stockData={products:DB.products,nextProductId:DB.nextProductId,exportDate:new Date().toISOString(),type:'stock-backup'};
    var blob=new Blob([JSON.stringify(stockData,null,2)],{type:'application/json'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;a.download='estoque-backup-'+new Date().toISOString().slice(0,10)+'.json';
    a.click();URL.revokeObjectURL(url);
    logActivity('BACKUP','Backup de estoque exportado — '+DB.products.length+' produtos');
    toast('Estoque exportado com sucesso!','success');
  };

  window.importStockBackupClick=function(){if(!hasFuncPermission('importStock')){toast('Sem permissao para importar estoque!','error');return}$('stockBackupFileInput').click()};

  function doImportStockBackup(e){
    var file=e.target.files[0];if(!file)return;
    var reader=new FileReader();
    reader.onload=function(ev){
      try{
        var data=JSON.parse(ev.target.result);
        var products=data.products||data;
        if(!Array.isArray(products)){toast('Arquivo de estoque invalido!','error');return}
        var hasProducts=products.length>0&&products[0].name!==undefined;
        if(!hasProducts){toast('Arquivo nao contem produtos validos!','error');return}
        if(!confirm('Isso SUBSTITUIRA todo o estoque atual ('+DB.products.length+' produtos) por '+products.length+' produtos do backup.\n\nContinuar?'))return;
        DB.products=products;
        if(data.nextProductId)DB.nextProductId=data.nextProductId;
        saveDB();
        logActivity('RESTORE','Estoque restaurado do arquivo: '+file.name+' — '+products.length+' produtos');
        renderBackup($('mainContent'));
        toast('Estoque restaurado com sucesso! ('+products.length+' produtos)','success');
      }catch(err){toast('Erro ao ler arquivo de estoque!','error');}
    };
    reader.readAsText(file);
    e.target.value='';
  }

  window.createStockServerBackup=function(){
    if(!hasFuncPermission('serverStockBackup')){toast('Sem permissao para criar backup de estoque no servidor!','error');return}
    if(!confirm('Criar backup de estoque no servidor?'))return;
    fetch('/api/stock-backups/create',{method:'POST',headers:{'Content-Type':'application/json','x-auth-token':getAuthToken()}})
    .then(function(r){return r.json()})
    .then(function(data){
      if(data.ok){
        logActivity('BACKUP','Backup de estoque criado no servidor: '+data.filename+' — '+data.products+' produtos');
        toast('Backup de estoque criado! ('+data.products+' produtos)','success');
        loadStockServerBackups();
      }else{
        toast(data.error||'Erro ao criar backup de estoque','error');
      }
    }).catch(function(){toast('Erro ao conectar com o servidor','error');});
  };

  window.loadStockServerBackups=function(){
    var el=$('stockBackupsList');
    if(!el)return;
    fetch('/api/stock-backups',{headers:{'x-auth-token':getAuthToken()}})
    .then(function(r){return r.json()})
    .then(function(data){
      if(!data.backups||data.backups.length===0){
        el.innerHTML='<div class="empty-msg">Nenhum backup de estoque encontrado</div>';
        return;
      }
      var html='<div class="table-wrap"><table><thead><tr><th>Data</th><th>Produtos</th><th>Tamanho</th><th>Acoes</th></tr></thead><tbody>';
      data.backups.forEach(function(b){
        var sizeKB=(b.size/1024).toFixed(1);
        var dateStr='';
        try{var d=new Date(b.date);dateStr=d.toLocaleDateString('pt-BR')+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});}catch(e){dateStr=b.date;}
        html+='<tr>'+
          '<td><strong>'+dateStr+'</strong></td>'+
          '<td>'+b.products+' produtos</td>'+
          '<td>'+sizeKB+' KB</td>'+
          '<td>'+
            '<button class="btn btn-sm" onclick="downloadStockServerBackup(\''+b.filename+'\')" title="Baixar"><i data-lucide="download" style="width:14px;height:14px"></i></button> '+
            '<button class="btn btn-sm" onclick="restoreStockServerBackup(\''+b.filename+'\')" title="Restaurar Estoque"><i data-lucide="rotate-ccw" style="width:14px;height:14px"></i></button> '+
            '<button class="btn btn-sm btn-danger" onclick="deleteStockServerBackup(\''+b.filename+'\')" title="Deletar"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>'+
          '</td></tr>';
      });
      html+='</tbody></table></div>';
      el.innerHTML=html;
      if(typeof lucide!=='undefined')lucide.createIcons();
    }).catch(function(){
      el.innerHTML='<div class="empty-msg">Erro ao carregar backups de estoque</div>';
    });
  };

  window.downloadStockServerBackup=function(filename){
    fetch('/api/stock-backups/download/'+filename,{headers:{'x-auth-token':getAuthToken()}})
    .then(function(r){
      if(!r.ok)throw new Error('Erro ao baixar');
      return r.blob();
    })
    .then(function(blob){
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a');
      a.href=url;a.download=filename;
      document.body.appendChild(a);a.click();a.remove();
      URL.revokeObjectURL(url);
      toast('Download de estoque concluido','success');
    }).catch(function(){toast('Erro ao baixar backup de estoque','error');});
  };

  window.restoreStockServerBackup=function(filename){
    if(!hasFuncPermission('restoreStock')){toast('Sem permissao para restaurar estoque!','error');return}
    if(!confirm('Isso SUBSTITUIRA todo o estoque atual pelo backup "'+filename+'".\n\nContinuar?'))return;
    fetch('/api/stock-backups/restore/'+filename,{method:'POST',headers:{'Content-Type':'application/json','x-auth-token':getAuthToken()}})
    .then(function(r){return r.json()})
    .then(function(data){
      if(data.ok){
        logActivity('RESTORE','Estoque restaurado do servidor: '+filename+' — '+data.products+' produtos');
        loadFromServer(function(ok){
          if(ok){renderBackup($('mainContent'));toast('Estoque restaurado com sucesso! ('+data.products+' produtos)','success');}
          else{toast('Restaurado, mas erro ao recarregar dados','error');}
        });
      }else{
        toast(data.error||'Erro ao restaurar estoque','error');
      }
    }).catch(function(){toast('Erro ao conectar com o servidor','error');});
  };

  window.deleteStockServerBackup=function(filename){
    if(!hasFuncPermission('deleteStock')){toast('Sem permissao para deletar backup de estoque!','error');return}
    if(!confirm('Deletar o backup de estoque "'+filename+'"?\n\nEsta acao nao pode ser desfeita.'))return;
    fetch('/api/stock-backups/delete/'+filename,{method:'DELETE',headers:{'x-auth-token':getAuthToken()}})
    .then(function(r){return r.json()})
    .then(function(data){
      if(data.ok){
        logActivity('BACKUP','Backup de estoque deletado do servidor: '+filename);
        toast('Backup de estoque deletado!','info');
        loadStockServerBackups();
      }else{
        toast(data.error||'Erro ao deletar backup de estoque','error');
      }
    }).catch(function(){toast('Erro ao conectar com o servidor','error');});
  };

  // ===== SUPPLIER BACKUP =====
  window.exportSupplierBackup=function(){
    if(!hasFuncPermission('exportSupplier')){toast('Sem permissao para exportar fornecedores!','error');return}
    var supData={suppliers:DB.suppliers,supplierOrders:DB.supplierOrders,nextSupplierId:DB.nextSupplierId,nextSupplierOrderId:DB.nextSupplierOrderId,exportDate:new Date().toISOString(),type:'supplier-backup'};
    var blob=new Blob([JSON.stringify(supData,null,2)],{type:'application/json'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;a.download='fornecedores-backup-'+new Date().toISOString().slice(0,10)+'.json';
    a.click();URL.revokeObjectURL(url);
    logActivity('BACKUP','Backup de fornecedores exportado — '+(DB.suppliers||[]).length+' fornecedores, '+(DB.supplierOrders||[]).length+' pedidos');
    toast('Fornecedores exportados com sucesso!','success');
  };

  window.importSupplierBackupClick=function(){if(!hasFuncPermission('importSupplier')){toast('Sem permissao para importar fornecedores!','error');return}$('supplierBackupFileInput').click()};

  function doImportSupplierBackup(e){
    var file=e.target.files[0];if(!file)return;
    var reader=new FileReader();
    reader.onload=function(ev){
      try{
        var data=JSON.parse(ev.target.result);
        var suppliers=data.suppliers||[];
        var orders=data.supplierOrders||[];
        if(!Array.isArray(suppliers)){toast('Arquivo de fornecedores invalido!','error');return}
        if(suppliers.length===0&&orders.length===0){toast('Arquivo nao contem dados de fornecedores!','error');return}
        if(!confirm('Isso SUBSTITUIRA todos os fornecedores e pedidos atuais.\n\nFornecedores: '+suppliers.length+'\nPedidos: '+orders.length+'\n\nContinuar?'))return;
        DB.suppliers=suppliers;
        DB.supplierOrders=orders;
        if(data.nextSupplierId)DB.nextSupplierId=data.nextSupplierId;
        if(data.nextSupplierOrderId)DB.nextSupplierOrderId=data.nextSupplierOrderId;
        saveDB();
        logActivity('RESTORE','Fornecedores restaurados do arquivo: '+file.name+' — '+suppliers.length+' fornecedores, '+orders.length+' pedidos');
        renderBackup($('mainContent'));
        toast('Fornecedores restaurados com sucesso!','success');
      }catch(err){toast('Erro ao ler arquivo de fornecedores!','error');}
    };
    reader.readAsText(file);
    e.target.value='';
  }

  window.createSupplierServerBackup=function(){
    if(!hasFuncPermission('serverSupplierBackup')){toast('Sem permissao para criar backup de fornecedores no servidor!','error');return}
    if(!confirm('Criar backup de fornecedores e pedidos no servidor?'))return;
    fetch('/api/supplier-backups/create',{method:'POST',headers:{'Content-Type':'application/json','x-auth-token':getAuthToken()}})
    .then(function(r){return r.json()})
    .then(function(data){
      if(data.ok){
        logActivity('BACKUP','Backup de fornecedores criado no servidor: '+data.filename+' — '+data.suppliers+' fornecedores, '+data.orders+' pedidos');
        toast('Backup de fornecedores criado! ('+data.suppliers+' fornecedores, '+data.orders+' pedidos)','success');
        loadSupplierServerBackups();
      }else{
        toast(data.error||'Erro ao criar backup de fornecedores','error');
      }
    }).catch(function(){toast('Erro ao conectar com o servidor','error');});
  };

  window.loadSupplierServerBackups=function(){
    var el=$('supplierBackupsList');
    if(!el)return;
    fetch('/api/supplier-backups',{headers:{'x-auth-token':getAuthToken()}})
    .then(function(r){return r.json()})
    .then(function(data){
      if(!data.backups||data.backups.length===0){
        el.innerHTML='<div class="empty-msg">Nenhum backup de fornecedores encontrado</div>';
        return;
      }
      var html='<div class="table-wrap"><table><thead><tr><th>Data</th><th>Fornecedores</th><th>Pedidos</th><th>Tamanho</th><th>Acoes</th></tr></thead><tbody>';
      data.backups.forEach(function(b){
        var sizeKB=(b.size/1024).toFixed(1);
        var dateStr='';
        try{var d=new Date(b.date);dateStr=d.toLocaleDateString('pt-BR')+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});}catch(e){dateStr=b.date;}
        html+='<tr>'+
          '<td><strong>'+dateStr+'</strong></td>'+
          '<td>'+b.suppliers+'</td>'+
          '<td>'+b.orders+'</td>'+
          '<td>'+sizeKB+' KB</td>'+
          '<td>'+
            '<button class="btn btn-sm" onclick="downloadSupplierServerBackup(\''+b.filename+'\')" title="Baixar"><i data-lucide="download" style="width:14px;height:14px"></i></button> '+
            '<button class="btn btn-sm" onclick="restoreSupplierServerBackup(\''+b.filename+'\')" title="Restaurar"><i data-lucide="rotate-ccw" style="width:14px;height:14px"></i></button> '+
            '<button class="btn btn-sm btn-danger" onclick="deleteSupplierServerBackup(\''+b.filename+'\')" title="Deletar"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>'+
          '</td></tr>';
      });
      html+='</tbody></table></div>';
      el.innerHTML=html;
      if(typeof lucide!=='undefined')lucide.createIcons();
    }).catch(function(){
      el.innerHTML='<div class="empty-msg">Erro ao carregar backups de fornecedores</div>';
    });
  };

  window.downloadSupplierServerBackup=function(filename){
    fetch('/api/supplier-backups/download/'+filename,{headers:{'x-auth-token':getAuthToken()}})
    .then(function(r){
      if(!r.ok)throw new Error('Erro ao baixar');
      return r.blob();
    })
    .then(function(blob){
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a');
      a.href=url;a.download=filename;
      document.body.appendChild(a);a.click();a.remove();
      URL.revokeObjectURL(url);
      toast('Download concluido','success');
    }).catch(function(){toast('Erro ao baixar backup','error');});
  };

  window.restoreSupplierServerBackup=function(filename){
    if(!hasFuncPermission('restoreSupplier')){toast('Sem permissao para restaurar fornecedores!','error');return}
    if(!confirm('Isso SUBSTITUIRA todos os fornecedores e pedidos atuais pelo backup "'+filename+'".\n\nContinuar?'))return;
    fetch('/api/supplier-backups/restore/'+filename,{method:'POST',headers:{'Content-Type':'application/json','x-auth-token':getAuthToken()}})
    .then(function(r){return r.json()})
    .then(function(data){
      if(data.ok){
        logActivity('RESTORE','Fornecedores restaurados do servidor: '+filename+' — '+data.suppliers+' fornecedores, '+data.orders+' pedidos');
        loadFromServer(function(ok){
          if(ok){renderBackup($('mainContent'));toast('Fornecedores restaurados com sucesso!','success');}
          else{toast('Restaurado, mas erro ao recarregar dados','error');}
        });
      }else{
        toast(data.error||'Erro ao restaurar fornecedores','error');
      }
    }).catch(function(){toast('Erro ao conectar com o servidor','error');});
  };

  window.deleteSupplierServerBackup=function(filename){
    if(!hasFuncPermission('deleteSupplier')){toast('Sem permissao para deletar backup de fornecedores!','error');return}
    if(!confirm('Deletar o backup de fornecedores "'+filename+'"?\n\nEsta acao nao pode ser desfeita.'))return;
    fetch('/api/supplier-backups/delete/'+filename,{method:'DELETE',headers:{'x-auth-token':getAuthToken()}})
    .then(function(r){return r.json()})
    .then(function(data){
      if(data.ok){
        logActivity('BACKUP','Backup de fornecedores deletado do servidor: '+filename);
        toast('Backup deletado!','info');
        loadSupplierServerBackups();
      }else{
        toast(data.error||'Erro ao deletar backup','error');
      }
    }).catch(function(){toast('Erro ao conectar com o servidor','error');});
  };
  function renderClients(m){
    var activeClients=DB.clients.filter(function(c){return c.active}).length;
    var totalDogs=DB.clients.reduce(function(s,c){return s+(c.dogs?c.dogs.length:0)},0);
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="user-round" style="width:24px;height:24px;vertical-align:middle"></i> Cadastro de Clientes</h2><div class="header-actions">'+
      '<button class="btn btn-ghost" onclick="exportClientTXT()"><i data-lucide="upload" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Exportar TXT</button>'+
      '<button class="btn btn-ghost" onclick="document.getElementById(\'importClientTXT\').click()"><i data-lucide="download" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Importar TXT</button>'+
      '<input type="file" id="importClientTXT" accept=".txt" style="display:none" onchange="importClientTXT(this)">'+
      '<button class="btn btn-primary" onclick="openClientModal()">+ Novo Cliente</button>'+
      '</div></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="user-round"></i></div><div class="sc-value">'+activeClients+'</div><div class="sc-label">Clientes Ativos</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="dog"></i></div><div class="sc-value">'+totalDogs+'</div><div class="sc-label">Pets Cadastrados</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="bath"></i></div><div class="sc-value">'+DB.bathGrooming.length+'</div><div class="sc-label">Servicos Banho/Tosa</div></div>'+
      '</div>'+
      '<div class="table-wrap"><div class="table-header"><h3>'+DB.clients.length+' clientes</h3>'+
      '<input type="text" class="table-search" id="clientSearch" placeholder="Buscar cliente..."></div>'+
      '<table><thead><tr><th>Nome</th><th>Telefone</th><th>CPF</th><th>Pets</th><th>Status</th><th>Acoes</th></tr></thead>'+
      '<tbody id="clientTableBody"></tbody></table></div>';
    renderClientTable();
    $('clientSearch').addEventListener('input',renderClientTable);
  }
  function renderClientTable(){
    var search=($('clientSearch')?$('clientSearch').value:'').trim().toLowerCase();
    var items=DB.clients.filter(function(c){return c.name.toLowerCase().includes(search)||c.phone.includes(search)||(c.cpf&&c.cpf.includes(search))});
    $('clientTableBody').innerHTML=items.map(function(c){
      var dogsHtml=c.dogs&&c.dogs.length>0?c.dogs.map(function(d,di){var ci=c.dogs.indexOf(d);return '<span class="badge-sm b-blue" style="margin:2px;display:inline-flex;align-items:center;gap:4px">'+(d.emoji||'🐕')+' '+d.name+' <button onclick="event.stopPropagation();openEditDogModal('+c.id+','+di+')" style="background:none;border:none;cursor:pointer;padding:0 2px;font-size:11px;color:var(--accent)" title="Editar Pet"><i data-lucide="pencil" style="width:14px;height:14px"></i></button><button onclick="event.stopPropagation();deleteDog('+c.id+','+di+')" style="background:none;border:none;cursor:pointer;padding:0 2px;font-size:11px;color:var(--danger)" title="Excluir Pet">✕</button></span>'}).join(''):'<span style="color:var(--txt2)">Nenhum pet</span>';
      return '<tr><td><strong>'+c.name+'</strong></td><td style="color:var(--txt2)">'+c.phone+'</td><td style="color:var(--txt2)">'+(c.cpf||'—')+'</td><td>'+dogsHtml+'</td><td>'+(c.active?'<span class="badge-sm b-green">Ativo</span>':'<span class="badge-sm b-red">Inativo</span>')+'</td><td><div class="action-btns"><button onclick="viewClientDetails('+c.id+')" title="Ver Detalhes" style="background:rgba(30,144,255,.15);color:var(--blue)"><i data-lucide="eye" style="width:14px;height:14px"></i></button><button onclick="openClientModal('+c.id+')" title="Editar"><i data-lucide="pencil" style="width:14px;height:14px"></i></button><button onclick="openAddDogModal('+c.id+')" title="Adicionar Pet"><i data-lucide="dog" style="width:14px;height:14px"></i></button><button onclick="printClientCard('+c.id+')" title="Imprimir Ficha"><i data-lucide="printer" style="width:14px;height:14px"></i></button><button class="danger" onclick="toggleClient('+c.id+')" title="'+(c.active?'Desativar':'Ativar')+'">'+(c.active?'⏻':'✓')+'</button><button class="danger" onclick="deleteClient('+c.id+')" title="Excluir Cliente"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button></div></td></tr>';
    }).join('');
  }
  window.openClientModal=function(id){
    var c=id?DB.clients.find(function(x){return x.id===id}):null;
    var body=pkField('client',id)+
      '<label>Nome Completo</label><input type="text" id="cName" value="'+(c?c.name:'')+'">'+
      '<label>Telefone</label><input type="text" id="cPhone" value="'+(c?c.phone:'')+'" placeholder="(11) 99999-0000">'+
      '<label>CPF</label><input type="text" id="cCpf" value="'+(c?c.cpf:'')+'" placeholder="000.000.000-00">'+
      '<label>E-mail</label><input type="email" id="cEmail" value="'+(c?c.email:'')+'" placeholder="cliente@email.com">'+
      '<label>Endereco</label><input type="text" id="cAddress" value="'+(c?c.address:'')+'">';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveClient('+(id?id:'null')+')">'+(c?'Salvar':'Adicionar')+'</button>';
    openModal(c?'Editar Cliente':'Novo Cliente',body,foot);
  };
  window.saveClient=function(id){
    var data={
      name:$('cName').value.trim(),
      phone:$('cPhone').value.trim(),
      cpf:$('cCpf').value.trim(),
      email:$('cEmail').value.trim(),
      address:$('cAddress').value.trim(),
      active:true
    };
    if(id){
      var existing=DB.clients.find(function(c){return c.id===id});
      if(existing)data.active=existing.active;
    }
    if(!data.name){toast('Nome obrigatorio!','error');return}
    if(!data.phone){toast('Telefone obrigatorio!','error');return}
    if(id){
      var idx=DB.clients.findIndex(function(c){return c.id===id});
      if(idx!==-1){data.dogs=DB.clients[idx].dogs||[];DB.clients[idx]=Object.assign(DB.clients[idx],data)}
      logActivity('CLIENTE_EDITADO','Cliente: '+data.name);
      toast('Cliente atualizado!','success');
    }else{
      data.id=genId('client');
      data.dogs=[];
      DB.clients.push(data);
      logActivity('CLIENTE_CRIADO','Cliente: '+data.name+' — '+data.phone);
      toast('Cliente adicionado!','success');
    }
    saveDB();closeModal();renderClientTable();
  };
  window.toggleClient=function(id){
    var c=DB.clients.find(function(x){return x.id===id});
    c.active=!c.active;
    logActivity('CLIENTE_STATUS',c.name+' — '+(c.active?'ativado':'desativado'));
    saveDB();renderClientTable();
    toast(c.name+(c.active?' ativado':' desativado'),'info');
  };

  // ===== ADD DOG MODAL =====
  window.openAddDogModal=function(clientId){
    var c=DB.clients.find(function(x){return x.id===clientId});
    if(!c)return;
    var body=
      '<div style="margin-bottom:12px;padding:12px;background:var(--bg3);border-radius:var(--r)"><strong>Cliente:</strong> '+c.name+'</div>'+
      '<label>Nome do Pet</label><input type="text" id="dogName" placeholder="Ex: Rex">'+
      '<label>Raca</label><input type="text" id="dogBreed" placeholder="Ex: Labrador, Poodle, Vira-lata...">'+
      '<label>Idade (anos)</label><input type="number" id="dogAge" min="0" max="30" placeholder="Ex: 3">'+
      '<label>Cor</label><input type="text" id="dogColor" placeholder="Ex: Dourado, Preto...">';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveDog('+clientId+')">Adicionar Pet</button>';
    openModal('Adicionar Pet ao Cliente',body,foot);
  };
  window.saveDog=function(clientId){
    var c=DB.clients.find(function(x){return x.id===clientId});
    if(!c)return;
    var name=$('dogName').value.trim();
    var breed=$('dogBreed').value.trim();
    var age=parseInt($('dogAge').value)||0;
    var color=$('dogColor').value.trim();
    if(!name){toast('Nome do pet obrigatorio!','error');return}
    if(!breed){toast('Raca obrigatoria!','error');return}
    var petEmojis=['🐕','🐶','🐩','🦮','🐕‍🦺','🐾'];
    var emoji=petEmojis[Math.floor(Math.random()*petEmojis.length)];
    if(!c.dogs)c.dogs=[];
    c.dogs.push({name:name,breed:breed,age:age,color:color,emoji:emoji});
    logActivity('PET_CRIADO','Pet: '+name+' (Raca: '+breed+') — Cliente: '+c.name);
    saveDB();closeModal();renderClientTable();
    toast('Pet '+name+' adicionado ao cliente '+c.name+'!','success');
  };

  // ===== VIEW CLIENT DETAILS =====
  window.viewClientDetails=function(id){
    var c=DB.clients.find(function(x){return x.id===id});
    if(!c)return;
    var baths=DB.bathGrooming.filter(function(b){return b.clientId===id});
    var totalBaths=baths.length;
    var totalSpent=baths.filter(function(b){return b.status==='Concluido'}).reduce(function(s,b){return s+b.price},0);
    var completedBaths=baths.filter(function(b){return b.status==='Concluido'}).length;
    var pendingBaths=baths.filter(function(b){return b.status==='Agendado'||b.status==='Em andamento'}).length;
    var dogsHtml='';
    if(c.dogs&&c.dogs.length>0){
      dogsHtml='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'+c.dogs.map(function(d){
        return '<div style="padding:12px;background:var(--bg3);border-radius:var(--r);display:flex;align-items:center;gap:10px">'+
          '<span style="font-size:28px">'+(d.emoji||'🐕')+'</span>'+
          '<div><div style="font-weight:700">'+d.name+'</div>'+
          '<div style="font-size:12px;color:var(--txt2)">'+d.breed+' — '+d.age+' anos</div>'+
          '<div style="font-size:12px;color:var(--txt2)">Cor: '+d.color+'</div></div></div>';
      }).join('')+'</div>';
    }else{
      dogsHtml='<div style="text-align:center;padding:20px;color:var(--txt2)">Nenhum pet cadastrado</div>';
    }
    var recentBathsHtml='';
    if(baths.length>0){
      recentBathsHtml='<table style="width:100%;font-size:12px;margin-top:8px"><thead><tr><th>Data</th><th>Servico</th><th>Pet</th><th>Valor</th><th>Status</th></tr></thead><tbody>'+
        baths.slice(0,5).map(function(b){
          var sc=b.status==='Agendado'?'b-blue':b.status==='Em andamento'?'b-yellow':b.status==='Concluido'?'b-green':'b-red';
          return '<tr><td>'+formatDate(b.date)+'</td><td>'+b.service+'</td><td>'+b.dogName+'</td><td style="font-weight:700">'+formatMoney(b.price)+'</td><td><span class="badge-sm '+sc+'">'+b.status+'</span></td></tr>';
        }).join('')+'</tbody></table>'+
        (baths.length>5?'<div style="text-align:center;margin-top:8px;font-size:11px;color:var(--txt2)">... e mais '+(baths.length-5)+' registros</div>':'');
    }else{
      recentBathsHtml='<div style="text-align:center;padding:12px;color:var(--txt2)">Nenhum servico registrado</div>';
    }
    var html=
      '<div style="text-align:center;margin-bottom:16px;padding:16px;background:var(--bg3);border-radius:var(--r)">'+
      '<div style="font-size:48px;margin-bottom:8px">'+(c.active?'<span style="color:var(--success)">●</span>':'<span style="color:var(--danger)">●</span>')+'</div>'+
      '<div style="font-size:20px;font-weight:900;color:var(--accent)">'+c.name+'</div>'+
      '<div style="margin-top:4px;color:var(--txt2)">'+c.phone+'</div>'+
      (c.email?'<div style="font-size:12px;color:var(--txt2)">'+c.email+'</div>':'')+
      '</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r);text-align:center"><div style="font-size:20px;font-weight:900;color:var(--accent)">'+totalBaths+'</div><div style="font-size:11px;color:var(--txt2)">Servicos</div></div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r);text-align:center"><div style="font-size:20px;font-weight:900;color:var(--accent)">'+formatMoney(totalSpent)+'</div><div style="font-size:11px;color:var(--txt2)">Total Gasto</div></div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r);text-align:center"><div style="font-size:20px;font-weight:900;color:var(--accent)">'+(c.dogs?c.dogs.length:0)+'</div><div style="font-size:11px;color:var(--txt2)">Pets</div></div>'+
      '</div>'+
      (c.cpf?'<div style="margin-bottom:12px"><span style="color:var(--txt2);font-size:12px">CPF:</span> <strong>'+c.cpf+'</strong></div>':'')+
      (c.address?'<div style="margin-bottom:12px"><span style="color:var(--txt2);font-size:12px">Endereco:</span> <strong>'+c.address+'</strong></div>':'')+
      '<div style="margin-bottom:8px"><span style="font-weight:700"><i data-lucide="dog" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Pets</span></div>'+
      dogsHtml+
      '<div style="margin-top:16px;margin-bottom:8px"><span style="font-weight:700"><i data-lucide="bath" style="width:16px;height:16px;vertical-align:middle"></i> Historico de Servicos</span></div>'+
      recentBathsHtml;
    var foot='<button class="btn btn-ghost" onclick="printClientCard('+id+')"><i data-lucide="printer" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Imprimir Ficha</button><button class="btn btn-ghost" onclick="closeModal();openClientModal('+id+')"><i data-lucide="pencil" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Editar</button><button class="btn btn-primary" onclick="closeModal()">Fechar</button>';
    openModal('Detalhes — '+c.name,html,foot);
  };

  // ===== DELETE CLIENT =====
  window.deleteClient=function(id){
    if(!hasFuncPermission('deleteClient')){toast('Sem permissao para excluir cliente!','error');return}
    if(!confirm('Deseja excluir este cliente? Esta acao nao pode ser desfeita.'))return;
    var c=DB.clients.find(function(x){return x.id===id});
    DB.clients=DB.clients.filter(function(c){return c.id!==id});
    logActivity('CLIENTE_EXCLUIDO','Cliente: '+(c?c.name:'ID '+id));
    saveDB();renderClients($('mainContent'));toast('Cliente excluido!','success');
  };

  // ===== EDIT DOG MODAL =====
  window.openEditDogModal=function(clientId,dogIndex){
    var c=DB.clients.find(function(x){return x.id===clientId});
    if(!c||!c.dogs||!c.dogs[dogIndex])return;
    var d=c.dogs[dogIndex];
    var body=
      '<div style="margin-bottom:12px;padding:12px;background:var(--bg3);border-radius:var(--r)"><strong>Cliente:</strong> '+c.name+'</div>'+
      '<label>Nome do Pet</label><input type="text" id="editDogName" value="'+d.name+'">'+
      '<label>Raca</label><input type="text" id="editDogBreed" value="'+d.breed+'">'+
      '<label>Idade (anos)</label><input type="number" id="editDogAge" min="0" max="30" value="'+d.age+'">'+
      '<label>Cor</label><input type="text" id="editDogColor" value="'+d.color+'">';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveEditDog('+clientId+','+dogIndex+')">Salvar</button>';
    openModal('Editar Pet — '+d.name,body,foot);
  };
  window.saveEditDog=function(clientId,dogIndex){
    var c=DB.clients.find(function(x){return x.id===clientId});
    if(!c||!c.dogs||!c.dogs[dogIndex])return;
    var name=$('editDogName').value.trim();
    var breed=$('editDogBreed').value.trim();
    var age=parseInt($('editDogAge').value)||0;
    var color=$('editDogColor').value.trim();
    if(!name){toast('Nome do pet obrigatorio!','error');return}
    if(!breed){toast('Raca obrigatoria!','error');return}
    c.dogs[dogIndex].name=name;
    c.dogs[dogIndex].breed=breed;
    c.dogs[dogIndex].age=age;
    c.dogs[dogIndex].color=color;
    logActivity('PET_EDITADO','Pet: '+name+' — Cliente: '+c.name);
    saveDB();closeModal();renderClientTable();
    toast('Pet atualizado!','success');
  };

  // ===== DELETE DOG =====
  window.deleteDog=function(clientId,dogIndex){
    if(!confirm('Remover este pet do cliente?'))return;
    var c=DB.clients.find(function(x){return x.id===clientId});
    if(!c||!c.dogs||!c.dogs[dogIndex])return;
    var petName=c.dogs[dogIndex].name;
    c.dogs.splice(dogIndex,1);
    logActivity('PET_EXCLUIDO','Pet: '+petName+' — Cliente: '+c.name);
    saveDB();renderClientTable();
    toast('Pet '+petName+' removido!','success');
  };

  // ===== PRINT CLIENT CARD =====
  window.printClientCard=function(id){
    var c=DB.clients.find(function(x){return x.id===id});
    if(!c)return;
    var co=getCompanyData();
    var coName=co?(co.fantasyName||co.name||'Empresa'):'PETSHOP PRADO';
    var dogsList=c.dogs&&c.dogs.length>0?c.dogs.map(function(d){return '<div class="r-item"><span>'+(d.emoji||'🐕')+' '+d.name+'</span><span>'+d.breed+' | '+d.age+' anos | '+d.color+'</span></div>'}).join(''):'<div class="r-item"><span>Nenhum pet</span><span>—</span></div>';
    var html='<div class="receipt" id="clientCardContent">'+
      '<div class="r-header"><h3>'+coName+'</h3>'+
      '<p>Ficha de Cliente</p>'+
      '<p>'+new Date().toLocaleDateString('pt-BR')+'</p></div>'+
      '<hr class="r-divider">'+
      '<div class="r-item"><span>Nome:</span><span>'+c.name+'</span></div>'+
      '<div class="r-item"><span>Telefone:</span><span>'+c.phone+'</span></div>'+
      (c.cpf?'<div class="r-item"><span>CPF:</span><span>'+c.cpf+'</span></div>':'')+
      (c.email?'<div class="r-item"><span>E-mail:</span><span>'+c.email+'</span></div>':'')+
      (c.address?'<div class="r-item"><span>Endereco:</span><span>'+c.address+'</span></div>':'')+
      '<hr class="r-divider">'+
      '<div style="font-weight:700;text-align:center;margin:6px 0">PETS</div>'+
      dogsList+
      '<hr class="r-divider">'+
      '<div class="r-footer">'+coName+'<br>Cadastro de Cliente #'+c.id+'</div></div>';
    openModal('Ficha — '+c.name,html,'<button class="btn btn-ghost" onclick="printClientCardWindow()"><i data-lucide="printer" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Imprimir</button><button class="btn btn-primary" onclick="closeModal()">Fechar</button>','modal-receipt');
  };
  window.printClientCardWindow=function(){
    var content=document.getElementById('clientCardContent');
    if(!content)return;
    smartPrint(content.innerHTML,{title:'Ficha do Cliente',width:70,fontSize:12});
  };

  // ===== EXPORT CLIENTS TXT =====
  window.exportClientTXT=function(){
    var co=getCompanyData();
    var coName=co?(co.fantasyName||co.name||'Empresa'):'PETSHOP PRADO';
    var activeClients=DB.clients.filter(function(c){return c.active});
    var allClients=DB.clients;
    var txt='';
    txt+='========================================\n';
    txt+='       '+coName.toUpperCase()+' — CADASTRO DE CLIENTES\n';
    txt+='========================================\n';
    txt+='Data: '+new Date().toLocaleString('pt-BR')+'\n';
    txt+='Gerado por: '+(currentUser?currentUser.name:'')+'\n';
    txt+='----------------------------------------\n\n';
    txt+='RESUMO\n';
    txt+='----------------------------------------\n';
    txt+='Total de Clientes:     '+allClients.length+'\n';
    txt+='Clientes Ativos:       '+activeClients.length+'\n';
    txt+='Clientes Inativos:     '+(allClients.length-activeClients.length)+'\n';
    txt+='Total de Pets:         '+allClients.reduce(function(s,c){return s+(c.dogs?c.dogs.length:0)},0)+'\n\n';
    txt+='----------------------------------------\n';
    txt+='LISTA DE CLIENTES\n';
    txt+='----------------------------------------\n\n';
    allClients.forEach(function(c,i){
      txt+=(i+1)+'. '+c.name.toUpperCase()+'\n';
      txt+='   Telefone: '+c.phone+'\n';
      if(c.cpf)txt+='   CPF:      '+c.cpf+'\n';
      if(c.email)txt+='   E-mail:   '+c.email+'\n';
      if(c.address)txt+='   Endereco: '+c.address+'\n';
      txt+='   Status:   '+(c.active?'ATIVO':'INATIVO')+'\n';
      if(c.dogs&&c.dogs.length>0){
        txt+='   Pets:\n';
        c.dogs.forEach(function(d){
          txt+='     - '+(d.emoji||'🐕')+' '+d.name+' | '+d.breed+' | '+d.age+' anos | '+d.color+'\n';
        });
      }
      txt+='\n';
    });
    txt+='========================================\n';
    txt+='FIM DO RELATORIO\n';
    txt+='========================================\n';
    var blob=new Blob([txt],{type:'text/plain;charset=utf-8'});
    var a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download='clientes_'+new Date().toISOString().slice(0,10)+'.txt';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Lista de clientes exportada!','success');
    logActivity('CLIENTES_EXPORTADOS','Relatorio TXT gerado — '+allClients.length+' clientes');
  };

  window.importClientTXT=function(input){
    var file=input.files[0];
    if(!file)return;
    var reader=new FileReader();
    reader.onload=function(e){
      var txt=e.target.result;
      var lines=txt.split('\n');
      var imported=0;
      var skipped=0;
      var currentClient=null;
      var currentDogs=[];
      var inClientSection=false;

      function saveCurrentClient(){
        if(currentClient){
          var exists=DB.clients.find(function(c){
            return c.name.toLowerCase()===currentClient.name.toLowerCase()||
                   (currentClient.cpf&&c.cpf===currentClient.cpf)||
                   (currentClient.phone&&c.phone===currentClient.phone);
          });
          if(exists){
            skipped++;
          }else{
            currentClient.id=genId('client');
            currentClient.dogs=currentDogs;
            DB.clients.push(currentClient);
            imported++;
          }
        }
        currentClient=null;
        currentDogs=[];
      }

      for(var i=0;i<lines.length;i++){
        var line=lines[i].trim();

        if(line.indexOf('LISTA DE CLIENTES')!==-1){
          inClientSection=true;
          continue;
        }
        if(line.indexOf('FIM DO RELATORIO')!==-1){
          saveCurrentClient();
          break;
        }
        if(!inClientSection)continue;

        var numberMatch=line.match(/^(\d+)\.\s+(.+)/);
        if(numberMatch){
          saveCurrentClient();
          currentClient={
            name:numberMatch[2].trim(),
            phone:'',
            cpf:'',
            email:'',
            address:'',
            active:true,
            dogs:[]
          };
          currentDogs=[];
          continue;
        }

        if(!currentClient)continue;

        var phoneMatch=line.match(/Telefone:\s*(.+)/);
        if(phoneMatch){
          currentClient.phone=phoneMatch[1].trim();
          continue;
        }

        var cpfMatch=line.match(/CPF:\s*(.+)/);
        if(cpfMatch){
          currentClient.cpf=cpfMatch[1].trim();
          continue;
        }

        var emailMatch=line.match(/E-mail:\s*(.+)/);
        if(emailMatch){
          currentClient.email=emailMatch[1].trim();
          continue;
        }

        var addressMatch=line.match(/Endereco:\s*(.+)/);
        if(addressMatch){
          currentClient.address=addressMatch[1].trim();
          continue;
        }

        var statusMatch=line.match(/Status:\s*(.+)/);
        if(statusMatch){
          currentClient.active=statusMatch[1].trim().toUpperCase()==='ATIVO';
          continue;
        }

        var petMatch=line.match(/^\s*-\s*([^\|]+)\|\s*([^\|]+)\|\s*(\d+)\s*anos?\s*\|\s*(.+)/);
        if(petMatch){
          var petEmojis=['🐕','🐶','🐩','🦮','🐕‍🦺','🐾'];
          currentDogs.push({
            name:petMatch[1].replace(/^[\p{So}\u200D\uFE0F]+\s*/u,'').trim(),
            breed:petMatch[2].trim(),
            age:parseInt(petMatch[3])||0,
            color:petMatch[4].trim(),
            emoji:petEmojis[Math.floor(Math.random()*petEmojis.length)]
          });
          continue;
        }
      }

      saveCurrentClient();
      saveDB();
      renderClients($('mainContent'));

      var msg='Importacao concluida! '+imported+' clientes importados';
      if(skipped>0)msg+=', '+skipped+' ignorados (ja existem)';
      toast(msg,'success');
      logActivity('CLIENTES_IMPORTADOS',imported+' clientes importados via TXT');
      input.value='';
    };
    reader.readAsText(file,'utf-8');
  };

  // ===== BATH & GROOMING =====
  var BathGroomingFilter='all';
  var BathDateFilter={start:'',end:''};
  var BathProfessionalFilter='all';
  function renderBathGrooming(m){
    var active=DB.bathGrooming.filter(function(b){
      if(BathGroomingFilter!=='all'&&b.status!==BathGroomingFilter)return false;
      if(BathProfessionalFilter!=='all'&&b.professional!==BathProfessionalFilter)return false;
      if(BathDateFilter.start){
        var bDate=new Date(b.date);
        var startDate=new Date(BathDateFilter.start+'T00:00:00');
        if(bDate<startDate)return false;
      }
      if(BathDateFilter.end){
        var bDate2=new Date(b.date);
        var endDate=new Date(BathDateFilter.end+'T23:59:59');
        if(bDate2>endDate)return false;
      }
      return true;
    });
    var agendados=DB.bathGrooming.filter(function(b){return b.status==='Agendado'}).length;
    var andamento=DB.bathGrooming.filter(function(b){return b.status==='Em andamento'}).length;
    var concluidos=DB.bathGrooming.filter(function(b){return b.status==='Concluido'}).length;
    var cancelados=DB.bathGrooming.filter(function(b){return b.status==='Cancelado'}).length;
    var totalFaturado=DB.bathGrooming.filter(function(b){return b.status==='Concluido'}).reduce(function(s,b){return s+b.price},0);
    var waitingList=(DB.waitingList||[]).length;
    var professionals=[...new Set(DB.bathGrooming.map(function(b){return b.professional}))];
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="bath" style="width:24px;height:24px;vertical-align:middle"></i> Banho & Tosa</h2><div class="header-actions">'+
      '<button class="btn btn-ghost" onclick="openWaitingListModal()"><i data-lucide="clock" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Lista de Espera ('+waitingList+')</button>'+
      '<button class="btn btn-primary" onclick="openBathModal()">+ Novo Agendamento</button>'+
      '</div></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="calendar"></i></div><div class="sc-value" style="color:var(--blue)">'+agendados+'</div><div class="sc-label">Agendados</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="refresh-cw"></i></div><div class="sc-value" style="color:#f39c12">'+andamento+'</div><div class="sc-label">Em Andamento</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="check-circle"></i></div><div class="sc-value" style="color:var(--success)">'+concluidos+'</div><div class="sc-label">Concluidos</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="x-circle"></i></div><div class="sc-value" style="color:var(--danger)">'+cancelados+'</div><div class="sc-label">Cancelados</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="banknote"></i></div><div class="sc-value">'+formatMoney(totalFaturado)+'</div><div class="sc-label">Faturamento</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="clock"></i></div><div class="sc-value" style="color:#f39c12">'+waitingList+'</div><div class="sc-label">Lista de Espera</div></div>'+
      '</div>'+
      '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center">'+
      '<button class="btn btn-ghost bath-filter active" data-filter="all">Todos</button>'+
      '<button class="btn btn-ghost bath-filter" data-filter="Agendado"><i data-lucide="calendar" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Agendados</button>'+
      '<button class="btn btn-ghost bath-filter" data-filter="Em andamento"><i data-lucide="refresh-cw" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Em Andamento</button>'+
      '<button class="btn btn-ghost bath-filter" data-filter="Concluido"><i data-lucide="check-circle" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Concluidos</button>'+
      '<button class="btn btn-ghost bath-filter" data-filter="Cancelado"><i data-lucide="x-circle" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Cancelados</button>'+
      '</div>'+
      '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;align-items:center">'+
      '<label style="font-size:12px;color:var(--txt2);font-weight:600">De:</label>'+
      '<input type="date" id="bathDateStart" value="'+BathDateFilter.start+'" style="padding:6px 10px;border:1px solid var(--border);border-radius:var(--r);background:var(--bg2);color:var(--txt);font-size:12px">'+
      '<label style="font-size:12px;color:var(--txt2);font-weight:600">Ate:</label>'+
      '<input type="date" id="bathDateEnd" value="'+BathDateFilter.end+'" style="padding:6px 10px;border:1px solid var(--border);border-radius:var(--r);background:var(--bg2);color:var(--txt);font-size:12px">'+
      '<label style="font-size:12px;color:var(--txt2);font-weight:600">Profissional:</label>'+
      '<select id="bathProFilter" style="padding:6px 10px;border:1px solid var(--border);border-radius:var(--r);background:var(--bg2);color:var(--txt);font-size:12px">'+
      '<option value="all">Todos</option>'+
      professionals.map(function(p){return '<option value="'+p+'"'+(BathProfessionalFilter===p?' selected':'')+'>'+p+'</option>'}).join('')+'</select>'+
      '<button class="btn btn-ghost" onclick="clearBathFilters()" style="font-size:12px;padding:6px 12px">Limpar Filtros</button>'+
      '<button class="btn btn-ghost" onclick="openBathReportModal()" style="font-size:12px;padding:6px 12px"><i data-lucide="bar-chart-3" style="width:14px;height:14px;vertical-align:middle"></i> Relatorio</button>'+
      '</div>'+
      '<div class="table-wrap"><div class="table-header"><h3>'+active.length+' registros</h3>'+
      '<input type="text" class="table-search" id="bathSearch" placeholder="Buscar..."></div>'+
      '<table><thead><tr><th>Pet</th><th>Cliente</th><th>Servico</th><th>Data</th><th>Profissional</th><th>Valor</th><th>Pagamento</th><th>Status</th><th>Avaliacao</th><th>Acoes</th></tr></thead>'+
      '<tbody id="bathTableBody"></tbody></table></div>';
    renderBathTable();
    $('bathSearch').addEventListener('input',renderBathTable);
    $('bathDateStart').addEventListener('change',function(){BathDateFilter.start=this.value;renderBathGrooming(m)});
    $('bathDateEnd').addEventListener('change',function(){BathDateFilter.end=this.value;renderBathGrooming(m)});
    $('bathProFilter').addEventListener('change',function(){BathProfessionalFilter=this.value;renderBathGrooming(m)});
    document.querySelectorAll('.bath-filter').forEach(function(btn){
      btn.addEventListener('click',function(){
        document.querySelectorAll('.bath-filter').forEach(function(b){b.classList.remove('active')});
        btn.classList.add('active');
        BathGroomingFilter=btn.dataset.filter;
        renderBathGrooming($('mainContent'));
      });
    });
  }
  window.clearBathFilters=function(){
    BathGroomingFilter='all';
    BathDateFilter={start:'',end:''};
    BathProfessionalFilter='all';
    renderBathGrooming($('mainContent'));
  };
  function renderBathTable(){
    var search=($('bathSearch')?$('bathSearch').value:'').trim().toLowerCase();
    var items=DB.bathGrooming.filter(function(b){
      if(BathGroomingFilter!=='all'&&b.status!==BathGroomingFilter)return false;
      if(BathProfessionalFilter!=='all'&&b.professional!==BathProfessionalFilter)return false;
      if(BathDateFilter.start){
        var bDate=new Date(b.date);
        var startDate=new Date(BathDateFilter.start+'T00:00:00');
        if(bDate<startDate)return false;
      }
      if(BathDateFilter.end){
        var bDate2=new Date(b.date);
        var endDate=new Date(BathDateFilter.end+'T23:59:59');
        if(bDate2>endDate)return false;
      }
      var client=DB.clients.find(function(c){return c.id===b.clientId});
      var clientName=client?client.name.toLowerCase():'';
      return b.dogName.toLowerCase().includes(search)||clientName.includes(search)||b.service.toLowerCase().includes(search);
    });
    $('bathTableBody').innerHTML=items.map(function(b){
      var client=DB.clients.find(function(c){return c.id===b.clientId});
      var statusClass=b.status==='Agendado'?'b-blue':b.status==='Em andamento'?'b-yellow':b.status==='Concluido'?'b-green':'b-red';
      var dogIcon='<i data-lucide="dog" style="width:16px;height:16px;vertical-align:middle;color:var(--accent)"></i>';
      if(client&&client.dogs){
        var dog=client.dogs.find(function(d){return d.name===b.dogName});
        if(dog){
          var breedLower=(dog.breed||'').toLowerCase();
          if(breedLower.indexOf('gato')!==-1||breedLower.indexOf('felino')!==-1){
            dogIcon='<i data-lucide="cat" style="width:16px;height:16px;vertical-align:middle;color:#a855f7"></i>';
          }else if(breedLower.indexOf('poodle')!==-1||breedLower.indexOf('pudel')!==-1){
            dogIcon='<i data-lucide="dog" style="width:16px;height:16px;vertical-align:middle;color:#f59e0b"></i>';
          }else{
            dogIcon='<i data-lucide="dog" style="width:16px;height:16px;vertical-align:middle;color:var(--accent)"></i>';
          }
        }
      }
      var actions='<div class="action-btns">';
      actions+='<button onclick="viewBathDetails('+b.id+')" title="Ver Detalhes" style="background:rgba(30,144,255,.15);color:var(--blue)"><i data-lucide="eye" style="width:14px;height:14px"></i></button>';
      actions+='<button onclick="openBathModal('+b.id+')" title="Editar"><i data-lucide="pencil" style="width:14px;height:14px"></i></button>';
      if(b.status==='Agendado'){
        actions+='<button onclick="startBath('+b.id+')" title="Iniciar" style="background:rgba(243,156,18,.15);color:#f39c12">▶</button>';
        actions+='<button onclick="completeBath('+b.id+')" title="Concluir" style="background:rgba(46,213,115,.15);color:var(--success)">✓</button>';
      }
      if(b.status==='Em andamento'){
        actions+='<button onclick="completeBath('+b.id+')" title="Concluir" style="background:rgba(46,213,115,.15);color:var(--success)">✓</button>';
      }
      if(b.status==='Concluido'&&!b.rating){
        actions+='<button onclick="rateBath('+b.id+')" title="Avaliar" style="background:rgba(255,193,7,.15);color:#ffc107">⭐</button>';
      }
      if(b.status!=='Cancelado'&&b.status!=='Concluido'){
        actions+='<button onclick="rescheduleBath('+b.id+')" title="Reagendar" style="background:rgba(0,188,212,.15);color:#00bcd4"><i data-lucide="calendar" style="width:14px;height:14px"></i></button>';
        actions+='<button onclick="duplicateBath('+b.id+')" title="Duplicar" style="background:rgba(156,39,176,.15);color:#9c27b0"><i data-lucide="copy" style="width:14px;height:14px"></i></button>';
      }
      if(b.status!=='Cancelado'&&b.status!=='Concluido'){
        actions+='<button class="danger" onclick="cancelBath('+b.id+')" title="Cancelar">✕</button>';
      }
        actions+='<button onclick="printBathReceipt('+b.id+')" title="Imprimir Comprovante" style="background:rgba(0,150,136,.15);color:#009688"><i data-lucide="printer" style="width:14px;height:14px"></i></button>';
        actions+='<button class="danger" onclick="deleteBath('+b.id+')" title="Excluir"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>';
      actions+='</div>';
      var payLabel=b.packageId?'Dinheiro (Pacote)':(b.paymentMethod||'Dinheiro');
      var payClass=b.packageId?'b-purple':b.paymentMethod==='PIX'?'b-blue':b.paymentMethod==='Cartao'?'b-yellow':'b-green';
      var ratingHtml=b.rating?'<span style="color:#ffc107">'+('⭐'.repeat(b.rating))+'</span>':'<span style="color:var(--txt2);font-size:11px">—</span>';
      return '<tr><td>'+dogIcon+' <strong>'+b.dogName+'</strong></td><td>'+(client?client.name:'—')+'</td><td><span class="badge-sm b-purple">'+b.service+'</span></td><td>'+formatDate(b.date)+'</td><td style="color:var(--txt2)">'+b.professional+'</td><td style="font-weight:700;color:var(--accent)">'+formatMoney(b.price)+'</td><td><span class="badge-sm '+payClass+'">'+payLabel+'</span></td><td><span class="badge-sm '+statusClass+'">'+b.status+'</span></td><td>'+ratingHtml+'</td><td>'+actions+'</td></tr>';
    }).join('');
    if(items.length===0)$('bathTableBody').innerHTML='<tr><td colspan="10" class="empty-msg">Nenhum registro encontrado</td></tr>';
    if(typeof lucide!=='undefined')lucide.createIcons();
  }

  // Ver detalhes do agendamento
  window.viewBathDetails=function(id){
    var b=DB.bathGrooming.find(function(x){return x.id===id});
    if(!b)return;
    var client=DB.clients.find(function(c){return c.id===b.clientId});
    var dogInfo='';
    if(client&&client.dogs){
      var dog=client.dogs.find(function(d){return d.name===b.dogName});
      if(dog)dogInfo='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:12px;background:var(--bg3);border-radius:var(--r);margin-bottom:12px">'+
        '<div><span style="color:var(--txt2);font-size:12px">Raca:</span><div style="font-weight:600">'+dog.breed+'</div></div>'+
        '<div><span style="color:var(--txt2);font-size:12px">Idade:</span><div style="font-weight:600">'+dog.age+' anos</div></div>'+
        '<div><span style="color:var(--txt2);font-size:12px">Cor:</span><div style="font-weight:600">'+dog.color+'</div></div>'+
        (dog.weight?'<div><span style="color:var(--txt2);font-size:12px">Peso:</span><div style="font-weight:600">'+dog.weight+' kg</div></div>':'')+
        '</div>';
    }
    var statusColors={'Agendado':'var(--blue)','Em andamento':'#f39c12','Concluido':'var(--success)','Cancelado':'var(--danger)'};
    var statusColor=statusColors[b.status]||'var(--txt2)';
    var html=
      '<div style="text-align:center;margin-bottom:16px;padding:16px;background:var(--bg3);border-radius:var(--r)">'+
      '<div style="font-size:36px;margin-bottom:8px"><i data-lucide="bath" style="width:36px;height:36px"></i></div>'+
      '<div style="font-size:20px;font-weight:900;color:var(--accent)">Venda #'+b.id+'</div>'+
      '<div style="margin-top:8px"><span class="badge-sm" style="background:'+statusColor+'22;color:'+statusColor+'">'+b.status+'</span></div></div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r)"><span style="color:var(--txt2);font-size:12px">Cliente</span><div style="font-weight:700;font-size:14px">'+(client?client.name:'—')+'</div><div style="font-size:12px;color:var(--txt2)">'+(client?client.phone:'')+'</div></div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r)"><span style="color:var(--txt2);font-size:12px">Pet</span><div style="font-weight:700;font-size:14px">'+b.dogName+'</div></div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r)"><span style="color:var(--txt2);font-size:12px">Servico</span><div style="font-weight:700;font-size:14px">'+b.service+'</div></div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r)"><span style="color:var(--txt2);font-size:12px">Profissional</span><div style="font-weight:700;font-size:14px">'+b.professional+'</div></div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r)"><span style="color:var(--txt2);font-size:12px">Data e Hora</span><div style="font-weight:700;font-size:14px">'+formatDate(b.date)+'</div></div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r)"><span style="color:var(--txt2);font-size:12px">Valor</span><div style="font-weight:900;font-size:18px;color:var(--accent)">'+formatMoney(b.price)+'</div></div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r)"><span style="color:var(--txt2);font-size:12px">Pagamento</span><div style="font-weight:700;font-size:14px">'+(b.paymentMethod||'Dinheiro')+(b.packageId?' (Pacote #'+b.packageId+')':'')+'</div>'+
      (b.packageId?'<div style="font-size:11px;margin-top:4px;color:var(--success)">✓ '+formatMoney(b.price)+' debitados do pacote — registrado como Dinheiro</div>':'')+
      '</div>'+
      '</div>'+
      dogInfo+
      (b.notes?'<div style="padding:12px;background:var(--bg3);border-radius:var(--r);margin-bottom:12px"><span style="color:var(--txt2);font-size:12px">Observacoes</span><div style="font-size:13px;margin-top:4px">'+b.notes+'</div></div>':'');
    var foot='<button class="btn btn-ghost" onclick="printBathReceipt('+b.id+')"><i data-lucide="printer" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Comprovante</button>';
    if(b.status==='Agendado')foot+=' <button class="btn btn-ghost" style="color:#f39c12" onclick="closeModal();startBath('+b.id+')">▶ Iniciar</button>';
    if(b.status==='Em andamento'||b.status==='Agendado')foot+=' <button class="btn btn-ghost" style="color:var(--success)" onclick="closeModal();completeBath('+b.id+')">✓ Concluir</button>';

    if(b.status!=='Cancelado'&&b.status!=='Concluido')foot+=' <button class="btn btn-ghost" style="color:var(--danger)" onclick="closeModal();cancelBath('+b.id+')">✕ Cancelar</button>';
    foot+=' <button class="btn btn-primary" onclick="closeModal()">Fechar</button>';
    openModal('Detalhes — '+b.dogName,html,foot,'modal-bath-details');
  };

  // Iniciar atendimento (Em andamento)
  window.startBath=function(id){
    var b=DB.bathGrooming.find(function(x){return x.id===id});
    if(!b)return;
    b.status='Em andamento';
    logActivity('BATH_INICIADO',b.dogName+' — '+b.service);
    saveDB();renderBathGrooming($('mainContent'));
    toast('Atendimento iniciado! '+b.dogName,'success');
  };

  // Concluir servico
  window.completeBath=function(id){
    var b=DB.bathGrooming.find(function(x){return x.id===id});
    if(!b)return;
    var body='<div style="text-align:center;padding:16px 0">'+
      '<div style="font-size:48px;margin-bottom:12px"><i data-lucide="check-circle" style="width:48px;height:48px"></i></div>'+
      '<div style="font-size:16px;font-weight:700;margin-bottom:8px">Concluir servico de '+b.dogName+'?</div>'+
      '<div style="font-size:13px;color:var(--txt2);margin-bottom:12px">'+b.service+' — '+formatMoney(b.price)+'</div>'+
      '<div style="font-size:13px;color:var(--txt2)">Profissional: '+b.professional+'</div></div>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Voltar</button>'+
      '<button class="btn btn-primary" style="background:var(--success);padding:12px 24px" onclick="confirmCompleteBath('+id+')">✔ Confirmar Conclusao</button>';
    openModal('Concluir Servico',body,foot,'modal-complete-bath');
  };
  window.confirmCompleteBath=function(id){
    var b=DB.bathGrooming.find(function(x){return x.id===id});
    if(!b)return;
    b.status='Concluido';
    b.completedAt=new Date().toISOString();
    logActivity('BATH_CONCLUIDO',b.dogName+' — '+b.service+' — '+formatMoney(b.price));
    saveDB();closeModal();renderBathGrooming($('mainContent'));
    toast('Servico concluido!','success');
  };

  // Cancelar com confirmacao
  window.cancelBath=function(id){
    var b=DB.bathGrooming.find(function(x){return x.id===id});
    if(!b)return;
    var body='<div style="text-align:center;padding:16px 0">'+
      '<div style="font-size:48px;margin-bottom:12px">⚠️</div>'+
      '<div style="font-size:16px;font-weight:700;margin-bottom:8px">Cancelar agendamento de '+b.dogName+'?</div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r);margin-bottom:12px">'+
      '<div style="font-size:13px;color:var(--txt2)">Servico: <strong>'+b.service+'</strong></div>'+
      '<div style="font-size:13px;color:var(--txt2)">Data: '+formatDate(b.date)+'</div>'+
      '<div style="font-size:13px;color:var(--txt2)">Valor: <strong style="color:var(--danger)">'+formatMoney(b.price)+'</strong></div></div>'+
      '<div style="font-size:12px;color:var(--txt2)">Esta acao nao pode ser desfeita.</div></div>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Voltar</button>'+
      '<button class="btn" style="background:var(--danger);color:#fff;padding:10px 24px;font-weight:700" onclick="confirmCancelBath('+id+')">✖ Confirmar Cancelamento</button>';
    openModal('Cancelar Agendamento',body,foot,'modal-cancel-bath');
  };
  window.confirmCancelBath=function(id){
    var b=DB.bathGrooming.find(function(x){return x.id===id});
    if(!b)return;
    var amountReturned=false;
    if(b.packageId&&b.creditDebited){
      var pkg=DB.clientPackages.find(function(p){return p.id===b.packageId});
      if(pkg){
        pkg.balance=Math.round((pkg.balance+b.price)*100)/100;
        pkg.usedAmount=Math.round((pkg.usedAmount-b.price)*100)/100;
        b.creditDebited=false;
        amountReturned=true;
        logActivity('PACOTE_ESTORNADO','Pacote #'+b.packageId+' — '+formatMoney(b.price)+' devolvidos ao cancelar agendamento');
      }
    }
    b.status='Cancelado';
    b.cancelledAt=new Date().toISOString();
    logActivity('BATH_CANCELADO',b.dogName+' — '+b.service+' — '+formatMoney(b.price));
    saveDB();closeModal();renderBathGrooming($('mainContent'));
    toast('Agendamento cancelado'+(amountReturned?' e valor devolvido ao pacote':''),'info');
  };

  // Excluir registro permanentemente
  window.deleteBath=function(id){
    var b=DB.bathGrooming.find(function(x){return x.id===id});
    if(!b)return;
    var msg='Excluir o agendamento de '+b.dogName+' — '+b.service+'?';
    if(b.packageId&&b.creditDebited)msg+='\n\nO valor de '+formatMoney(b.price)+' sera devolvido ao pacote.';
    msg+='\n\nEsta acao nao pode ser desfeita.';
    if(!confirm(msg))return;
    if(b.packageId&&b.creditDebited){
      var pkg=DB.clientPackages.find(function(p){return p.id===b.packageId});
      if(pkg){
        pkg.balance=Math.round((pkg.balance+b.price)*100)/100;
        pkg.usedAmount=Math.round((pkg.usedAmount-b.price)*100)/100;
        logActivity('PACOTE_ESTORNADO','Pacote #'+b.packageId+' — '+formatMoney(b.price)+' devolvidos ao excluir agendamento');
      }
    }
    DB.bathGrooming=DB.bathGrooming.filter(function(x){return x.id!==id});
    logActivity('BATH_EXCLUIDO',b.dogName+' — '+b.service+' — '+formatMoney(b.price));
    saveDB();renderBathGrooming($('mainContent'));toast('Registro excluido!','success');
  };

  // Debitar valor do pacote manualmente
  window.debitBathCredit=function(id){
    var b=DB.bathGrooming.find(function(x){return x.id===id});
    if(!b)return;
    var pkg=b.packageId?DB.clientPackages.find(function(p){return p.id===b.packageId}):null;
    if(!pkg){toast('Pacote nao encontrado!','error');return}
    var remaining=pkg.balance;
    var body='<div style="text-align:center;padding:16px 0">'+
      '<div style="font-size:48px;margin-bottom:12px"><i data-lucide="ticket" style="width:48px;height:48px"></i></div>'+
      '<div style="font-size:16px;font-weight:700;margin-bottom:8px">Debitar '+formatMoney(b.price)+' do pacote?</div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r);margin-bottom:12px">'+
      '<div style="font-size:13px;color:var(--txt2)">Pacote: <strong>#'+pkg.id+' — '+pkg.serviceName+'</strong></div>'+
      '<div style="font-size:13px;color:var(--txt2)">Saldo restante: <strong>'+formatMoney(remaining)+'</strong></div>'+
      '<div style="font-size:13px;color:var(--txt2)">Apos debito: <strong>'+formatMoney(remaining-b.price)+'</strong></div>'+
      '</div>'+
      '<div style="font-size:12px;color:var(--txt2)">Servico: '+b.service+' — '+b.dogName+'</div></div>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>'+
      '<button class="btn btn-primary" onclick="confirmDebitBathCredit('+id+')"><i data-lucide="ticket" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Confirmar Debito</button>';
    openModal('Debitar Valor do Pacote',body,foot);
  };
  window.confirmDebitBathCredit=function(id){
    var b=DB.bathGrooming.find(function(x){return x.id===id});
    if(!b)return;
    var pkg=b.packageId?DB.clientPackages.find(function(p){return p.id===b.packageId}):null;
    if(!pkg){toast('Pacote nao encontrado!','error');return}
    if(b.creditDebited){toast('Valor ja foi debitado!','error');return}
    if(pkg.balance<b.price){toast('Saldo insuficiente no pacote!','error');return}
    pkg.balance=Math.round((pkg.balance-b.price)*100)/100;
    pkg.usedAmount=Math.round((pkg.usedAmount+b.price)*100)/100;
    b.creditDebited=true;
    b.paymentMethod='Dinheiro';
    logActivity('PACOTE_DEBITADO','Pacote #'+b.packageId+' — '+b.service+' — '+b.dogName+' — Debito manual de '+formatMoney(b.price)+' — registrado como Dinheiro');
    saveDB();closeModal();renderBathGrooming($('mainContent'));
    toast('Valor debitado com sucesso! (registrado como Dinheiro)','success');
  };

  // Reagendar servico
  window.rescheduleBath=function(id){
    var b=DB.bathGrooming.find(function(x){return x.id===id});
    if(!b)return;
    var client=DB.clients.find(function(c){return c.id===b.clientId});
    var body=
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r);margin-bottom:16px">'+
      '<div style="font-size:14px;font-weight:700">'+b.dogName+' — '+b.service+'</div>'+
      '<div style="font-size:12px;color:var(--txt2)">Cliente: '+(client?client.name:'—')+'</div>'+
      '<div style="font-size:12px;color:var(--txt2)">Data atual: '+formatDate(b.date)+'</div>'+
      '</div>'+
      '<label>Nova Data e Hora</label><input type="datetime-local" id="rescheduleDate" value="'+toLocalInputValue(b.date)+'">'+
      '<label>Manter profissional: <strong>'+b.professional+'</strong></label>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>'+
      '<button class="btn btn-primary" onclick="confirmRescheduleBath('+id+')"><i data-lucide="calendar" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Reagendar</button>';
    openModal('Reagendar Servico',body,foot);
  };
  window.confirmRescheduleBath=function(id){
    var b=DB.bathGrooming.find(function(x){return x.id===id});
    if(!b)return;
    var newDate=$('rescheduleDate').value;
    if(!newDate){toast('Selecione a nova data!','error');return}
    var oldDate=b.date;
    b.date=new Date(newDate).toISOString();
    b.rescheduledFrom=oldDate;
    logActivity('BATH_REAGENDADO',b.dogName+' — '+b.service+' — Nova data: '+formatDate(b.date));
    saveDB();closeModal();renderBathGrooming($('mainContent'));
    toast('Servico reagendado!','success');
  };

  // Duplicar agendamento
  window.duplicateBath=function(id){
    var b=DB.bathGrooming.find(function(x){return x.id===id});
    if(!b)return;
    var client=DB.clients.find(function(c){return c.id===b.clientId});
    var body=
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r);margin-bottom:16px">'+
      '<div style="font-size:14px;font-weight:700">'+b.dogName+' — '+b.service+'</div>'+
      '<div style="font-size:12px;color:var(--txt2)">Cliente: '+(client?client.name:'—')+'</div>'+
      '<div style="font-size:12px;color:var(--txt2)">Profissional: '+b.professional+'</div>'+
      '<div style="font-size:12px;color:var(--txt2)">Valor: '+formatMoney(b.price)+'</div>'+
      '</div>'+
      '<label>Data e Hora do Novo Agendamento</label><input type="datetime-local" id="duplicateDate" value="'+toLocalInputValue(Date.now()+86400000)+'">'+
      '<label>Forma de Pagamento</label><select id="duplicatePayment">'+
      '<option value="Dinheiro">Dinheiro</option><option value="PIX">PIX</option><option value="Cartao">Cartao</option>'+
      '</select>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>'+
      '<button class="btn btn-primary" onclick="confirmDuplicateBath('+id+')"><i data-lucide="copy" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Duplicar</button>';
    openModal('Duplicar Agendamento',body,foot);
  };
  window.confirmDuplicateBath=function(id){
    var b=DB.bathGrooming.find(function(x){return x.id===id});
    if(!b)return;
    var newDate=$('duplicateDate').value;
    var payment=$('duplicatePayment').value;
    if(!newDate){toast('Selecione a data!','error');return}
    var newBath={
      id:genId('bath'),
      clientId:b.clientId,
      dogName:b.dogName,
      service:b.service,
      date:new Date(newDate).toISOString(),
      professional:b.professional,
      price:b.price,
      notes:b.notes,
      paymentMethod:payment,
      packageId:null,
      creditDebited:false,
      status:'Agendado',
      duplicatedFrom:b.id
    };
    DB.bathGrooming.push(newBath);
    logActivity('BATH_DUPLICADO','Agendamento duplicado: '+b.dogName+' — '+b.service);
    saveDB();closeModal();renderBathGrooming($('mainContent'));
    toast('Agendamento duplicado!','success');
  };

  // Avaliacao do cliente
  window.rateBath=function(id){
    var b=DB.bathGrooming.find(function(x){return x.id===id});
    if(!b)return;
    var body=
      '<div style="text-align:center;padding:16px 0">'+
      '<div style="font-size:48px;margin-bottom:12px">⭐</div>'+
      '<div style="font-size:16px;font-weight:700;margin-bottom:8px">Avaliar servico de '+b.dogName+'?</div>'+
      '<div style="font-size:13px;color:var(--txt2);margin-bottom:16px">'+b.service+' — '+b.professional+'</div>'+
      '<div id="ratingStars" style="font-size:36px;cursor:pointer;letter-spacing:8px">'+
      '<span data-star="1" onclick="setRating(1)">☆</span>'+
      '<span data-star="2" onclick="setRating(2)">☆</span>'+
      '<span data-star="3" onclick="setRating(3)">☆</span>'+
      '<span data-star="4" onclick="setRating(4)">☆</span>'+
      '<span data-star="5" onclick="setRating(5)">☆</span>'+
      '</div>'+
      '<div id="ratingLabel" style="margin-top:8px;font-size:14px;color:var(--txt2)"></div>'+
      '</div>'+
      '<label>Comentario (opcional)</label><textarea id="ratingComment" rows="2" placeholder="Deixe um comentario sobre o servico...">'+(b.ratingComment||'')+'</textarea>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>'+
      '<button class="btn btn-primary" onclick="saveRating('+id+')">💾 Salvar Avaliacao</button>';
    openModal('Avaliar Servico',body,foot);
    window._currentRating=b.rating||0;
    if(b.rating)setRating(b.rating);
  };
  window._currentRating=0;
  window.setRating=function(stars){
    window._currentRating=stars;
    var labels=['','Ruim','Regular','Bom','Muito Bom','Excelente'];
    var colors=['','#ff4757','#ff6348','#f39c12','#2ed573','#00bcd4'];
    document.querySelectorAll('#ratingStars span').forEach(function(s){
      var val=parseInt(s.dataset.star);
      s.textContent=val<=stars?'★':'☆';
      s.style.color=val<=stars?colors[stars]:'var(--txt2)';
    });
    $('ratingLabel').textContent=labels[stars];
    $('ratingLabel').style.color=colors[stars];
  };
  window.saveRating=function(id){
    var b=DB.bathGrooming.find(function(x){return x.id===id});
    if(!b)return;
    if(window._currentRating===0){toast('Selecione uma avaliacao!','error');return}
    b.rating=window._currentRating;
    b.ratingComment=$('ratingComment').value.trim();
    b.ratingDate=new Date().toISOString();
    logActivity('BATH_AVALIADO',b.dogName+' — '+b.service+' — '+window._currentRating+' estrelas');
    saveDB();closeModal();renderBathGrooming($('mainContent'));
    toast('Avaliacao salva! Obrigado.','success');
  };

  // Lista de espera
  window.openWaitingListModal=function(){
    if(!DB.waitingList)DB.waitingList=[];
    var body=
      '<div style="margin-bottom:16px">'+
      '<button class="btn btn-primary" onclick="openAddWaitingItem()" style="margin-bottom:12px">+ Adicionar a Lista</button>'+
      '<div id="waitingListContent"></div>'+
      '</div>';
    var foot='<button class="btn btn-primary" onclick="closeModal()">Fechar</button>';
    openModal('<i data-lucide="clock" style="width:14px;height:14px;vertical-align:middle"></i> Lista de Espera',body,foot);
    renderWaitingList();
  };
  window.openAddWaitingItem=function(){
    var activeClients=DB.clients.filter(function(c){return c.active});
    var services=DB.services.filter(function(s){return s.active});
    var body=
      '<label>Cliente</label><select id="wClientId" onchange="updateWaitingDogSelect()">'+
      '<option value="">Selecione o cliente...</option>'+
      activeClients.map(function(c){return '<option value="'+c.id+'">'+c.name+'</option>'}).join('')+'</select>'+
      '<label>Pet</label><select id="wDogName"><option value="">Selecione o pet...</option></select>'+
      '<label>Servico</label><select id="wService">'+
      services.map(function(s){return '<option value="'+s.name+'">'+s.name+' — '+formatMoney(s.price)+'</option>'}).join('')+'</select>'+
      '<label>Observacoes</label><input type="text" id="wNotes" placeholder="Preferencia de data/horario...">';
    var foot='<button class="btn btn-ghost" onclick="openWaitingListModal()">Voltar</button>'+
      '<button class="btn btn-primary" onclick="saveWaitingItem()">+ Adicionar</button>';
    openModal('Adicionar a Lista de Espera',body,foot);
  };
  window.updateWaitingDogSelect=function(){
    var clientId=parseInt($('wClientId').value)||0;
    var sel=$('wDogName');
    sel.innerHTML='<option value="">Selecione o pet...</option>';
    if(!clientId)return;
    var c=DB.clients.find(function(x){return x.id===clientId});
    if(!c||!c.dogs)return;
    c.dogs.forEach(function(d){
      var opt=document.createElement('option');
      opt.value=d.name;
      opt.textContent=d.name+' ('+d.breed+')';
      sel.appendChild(opt);
    });
  };
  window.saveWaitingItem=function(){
    var clientId=parseInt($('wClientId').value)||0;
    var dogName=$('wDogName').value;
    var service=$('wService').value;
    var notes=$('wNotes').value.trim();
    if(!clientId){toast('Selecione o cliente!','error');return}
    if(!dogName){toast('Selecione o pet!','error');return}
    if(!DB.waitingList)DB.waitingList=[];
    DB.waitingList.push({
      id:Date.now(),
      clientId:clientId,
      dogName:dogName,
      service:service,
      notes:notes,
      addedAt:new Date().toISOString()
    });
    logActivity('LISTA_ESPERA_ADICIONADO',dogName+' — '+service);
    saveDB();openWaitingListModal();
    toast('Adicionado a lista de espera!','success');
  };
  window.removeFromWaitingList=function(id){
    if(!confirm('Remover da lista de espera?'))return;
    DB.waitingList=DB.waitingList.filter(function(w){return w.id!==id});
    logActivity('LISTA_ESPERA_REMOVIDO','Item removido da lista');
    saveDB();renderWaitingList();
    toast('Removido da lista!','info');
  };
  var promotingWaitingId=null;
  window.promoteFromWaitingList=function(id){
    var item=(DB.waitingList||[]).find(function(w){return w.id===id});
    if(!item)return;
    promotingWaitingId=id;
    openWaitingListModal();
    closeModal();
    setTimeout(function(){
      openBathModal();
      setTimeout(function(){
        if($('bClientId')){$('bClientId').value=item.clientId;updateDogSelect(item.dogName);$('bService').value=item.service}
      },200);
    },200);
  };
  function renderWaitingList(){
    var list=DB.waitingList||[];
    var el=document.getElementById('waitingListContent');
    if(!el)return;
    if(list.length===0){
      el.innerHTML='<div style="text-align:center;padding:20px;color:var(--txt2)">Nenhum item na lista de espera</div>';
      return;
    }
    el.innerHTML=list.map(function(w){
      var client=DB.clients.find(function(c){return c.id===w.clientId});
      var dateStr=new Date(w.addedAt).toLocaleDateString('pt-BR');
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--bg3);border-radius:var(--r);margin-bottom:8px">'+
        '<div>'+
        '<div style="font-weight:700">'+w.dogName+' — '+w.service+'</div>'+
        '<div style="font-size:12px;color:var(--txt2)">Cliente: '+(client?client.name:'—')+' | Adicionado: '+dateStr+'</div>'+
        (w.notes?'<div style="font-size:11px;color:var(--txt2);margin-top:4px">'+w.notes+'</div>':'')+
        '</div>'+
        '<div style="display:flex;gap:6px">'+
        '<button class="btn btn-ghost" onclick="promoteFromWaitingList('+w.id+')" title="Criar Agendamento" style="font-size:12px;padding:4px 8px;background:rgba(46,213,115,.15);color:var(--success)"><i data-lucide="calendar" style="width:14px;height:14px;vertical-align:middle;margin-right:2px"></i>Agendar</button>'+
        '<button class="btn btn-ghost danger" onclick="removeFromWaitingList('+w.id+')" title="Remover" style="font-size:12px;padding:4px 8px">✕</button>'+
        '</div></div>';
    }).join('');
  }

  // Relatorio por profissional
  window.openBathReportModal=function(){
    var professionals=[...new Set(DB.bathGrooming.map(function(b){return b.professional}))];
    var html='<div style="max-height:60vh;overflow-y:auto">';
    professionals.forEach(function(pro){
      var proBaths=DB.bathGrooming.filter(function(b){return b.professional===pro});
      var concluidos=proBaths.filter(function(b){return b.status==='Concluido'});
      var totalFaturado=concluidos.reduce(function(s,b){return s+b.price},0);
      var avgRating=concluidos.filter(function(b){return b.rating}).reduce(function(s,b){return s+b.rating},0)/(concluidos.filter(function(b){return b.rating}).length||1);
      var servicos={};
      concluidos.forEach(function(b){
        if(!servicos[b.service])servicos[b.service]={count:0,revenue:0};
        servicos[b.service].count++;
        servicos[b.service].revenue+=b.price;
      });
      html+='<div style="padding:16px;background:var(--bg3);border-radius:var(--r);margin-bottom:12px">'+
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">'+
        '<div style="font-size:16px;font-weight:700"><i data-lucide="user" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i> '+pro+'</div>'+
        '<div style="font-size:14px;color:var(--accent);font-weight:700">'+formatMoney(totalFaturado)+'</div>'+
        '</div>'+
        '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">'+
        '<div style="text-align:center;padding:8px;background:var(--bg2);border-radius:var(--r)"><div style="font-size:18px;font-weight:900">'+proBaths.length+'</div><div style="font-size:10px;color:var(--txt2)">Total</div></div>'+
        '<div style="text-align:center;padding:8px;background:var(--bg2);border-radius:var(--r)"><div style="font-size:18px;font-weight:900;color:var(--success)">'+concluidos.length+'</div><div style="font-size:10px;color:var(--txt2)">Concluidos</div></div>'+
        '<div style="text-align:center;padding:8px;background:var(--bg2);border-radius:var(--r)"><div style="font-size:18px;font-weight:900;color:var(--accent)">'+formatMoney(totalFaturado)+'</div><div style="font-size:10px;color:var(--txt2)">Faturamento</div></div>'+
        '<div style="text-align:center;padding:8px;background:var(--bg2);border-radius:var(--r)"><div style="font-size:18px;font-weight:900;color:#ffc107">'+avgRating.toFixed(1)+'</div><div style="font-size:10px;color:var(--txt2)">Avaliacao Media</div></div>'+
        '</div>'+
        '<div style="font-size:12px;font-weight:600;margin-bottom:8px;color:var(--txt2)">Servicos Realizados:</div>'+
        Object.keys(servicos).map(function(s){
          return '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px"><span>'+s+'</span><span style="color:var(--txt2)">'+servicos[s].count+'x — '+formatMoney(servicos[s].revenue)+'</span></div>';
        }).join('')+
        '</div>';
    });
    html+='</div>';
    var foot='<button class="btn btn-primary" onclick="closeModal()">Fechar</button>';
    openModal('<i data-lucide="bar-chart-3" style="width:18px;height:18px;vertical-align:middle"></i> Relatorio por Profissional',html,foot,'modal-report');
  };

  // Abrir modal de agendamento (com opcao de cadastrar pet)
  window.openBathModal=function(id){
    var b=id?DB.bathGrooming.find(function(x){return x.id===id}):null;
    var activeClients=DB.clients.filter(function(c){return c.active});
    var services=DB.services.filter(function(s){return s.active});
    var professionals=DB.employees.filter(function(e){return e.active}).map(function(e){return e.name});
    var dateValue=b?toLocalInputValue(b.date):toLocalInputValue(new Date());
    var paymentMethods=['Dinheiro','Cartao','PIX','Pacote'];
    var initialService=services[0];
    var initialPrice=b?b.price:(initialService?initialService.price:0);
    var priceHtml=b?
      '<label>Valor (R$)</label><input type="number" step="0.01" id="bPrice" value="'+b.price+'">':
      '<label>Valor (R$)</label><div id="bPriceDisplay" style="padding:10px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);font-weight:800;color:var(--accent)">'+formatMoney(initialPrice)+'</div><input type="hidden" id="bPrice" value="'+initialPrice+'">';
    var body=
      '<label>Cliente</label><div style="display:flex;gap:8px"><select id="bClientId" onchange="updateDogSelect();updatePkgOptions(null,'+(!b)+');updatePkgInfo()" style="flex:1">'+
      '<option value="">Selecione o cliente...</option>'+
      activeClients.map(function(c){return '<option value="'+c.id+'"'+(b&&b.clientId===c.id?' selected':'')+'>'+c.name+' ('+c.phone+')</option>'}).join('')+'</select>'+
      '<button class="btn btn-ghost" onclick="openAddDogFromBath()" title="Cadastrar novo pet" style="white-space:nowrap;padding:8px 12px"><i data-lucide="dog" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>+ Pet</button></div>'+
      '<div id="bPkgInfo"></div>'+
      '<label>Pet</label><div style="display:flex;gap:8px"><select id="bDogName" style="flex:1"><option value="">Selecione o pet...</option></select>'+
      '<button class="btn btn-ghost" onclick="openAddDogFromBath()" title="Cadastrar novo pet para este cliente" style="white-space:nowrap;padding:8px 12px;font-size:12px">+ Novo</button></div>'+
      '<label>Servico</label><select id="bService" onchange="updatePkgOptions(null,'+(!b)+');updateBathPrice()">'+services.map(function(s){return '<option value="'+s.name+'"'+(b&&b.service===s.name?' selected':'')+'>'+s.name+' — '+formatMoney(s.price)+'</option>'}).join('')+'</select>'+
      '<label>Data e Hora</label><input type="datetime-local" id="bDate" value="'+dateValue+'">'+
      '<label>Profissional</label><select id="bProfessional">'+professionals.map(function(p){return '<option'+(b&&b.professional===p?' selected':'')+'>'+p+'</option>'}).join('')+'</select>'+
      '<label>Forma de Pagamento</label><select id="bPayment" onchange="updatePkgOptions(null,false)">'+
      paymentMethods.map(function(pm){return '<option value="'+pm+'"'+((b&&b.packageId)?(pm==='Pacote'?' selected':''):(b&&b.paymentMethod===pm?' selected':''))+'>'+pm+'</option>'}).join('')+'</select>'+
      '<div id="bPkgRow" style="display:none"><label>Pacote</label><select id="bPackageId"><option value="">Selecione o pacote...</option></select></div>'+
      priceHtml+
      '<label>Observacoes</label><textarea id="bNotes" rows="2">'+(b?b.notes||'':'')+'</textarea>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveBath('+(id?id:'null')+')">'+(b?'Salvar':'Agendar')+'</button>';
    openModal(b?'Editar Agendamento':'Novo Agendamento de Banho & Tosa',body,foot);
    if(b&&b.clientId){setTimeout(function(){updateDogSelect(b.dogName);updatePkgOptions(b.packageId);updatePkgInfo()},100)}
  };

  // Cadastrar pet direto do modal de banho
  window.openAddDogFromBath=function(){
    var clientId=parseInt($('bClientId').value)||0;
    if(!clientId){toast('Selecione o cliente primeiro!','error');return}
    var c=DB.clients.find(function(x){return x.id===clientId});
    if(!c)return;
    var body=
      '<div style="padding:8px 12px;background:var(--bg3);border-radius:var(--r);margin-bottom:16px;font-size:13px">Cadastrando pet para: <strong>'+c.name+'</strong></div>'+
      '<label>Nome do Pet</label><input type="text" id="dogName" placeholder="Ex: Rex, Luna...">'+
      '<label>Raca</label><input type="text" id="dogBreed" placeholder="Ex: Labrador, Poodle...">'+
      '<label>Idade (anos)</label><input type="number" id="dogAge" min="0" max="30" value="1">'+
      '<label>Cor</label><input type="text" id="dogColor" placeholder="Ex: Dourado, Preto...">'+
      '<label>Peso (kg) — opcional</label><input type="number" step="0.1" id="dogWeight" placeholder="Ex: 12.5">';
    var foot='<button class="btn btn-ghost" onclick="closeDogModal()">Cancelar</button>'+
      '<button class="btn btn-primary" onclick="saveDogFromBath('+clientId+')"><i data-lucide="dog" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Cadastrar Pet</button>';
    openModal('Cadastrar Pet',body,foot,'modal-add-dog');
  };
  window.closeDogModal=function(){
    closeModal();
    setTimeout(function(){openBathModal()},200);
  };
  window.saveDogFromBath=function(clientId){
    var name=$('dogName').value.trim();
    var breed=$('dogBreed').value.trim();
    var age=parseInt($('dogAge').value)||0;
    var color=$('dogColor').value.trim();
    var weight=parseFloat($('dogWeight').value)||0;
    if(!name){toast('Informe o nome do pet!','error');return}
    if(!breed){toast('Informe a raca!','error');return}
    var c=DB.clients.find(function(x){return x.id===clientId});
    if(!c)return;
    if(!c.dogs)c.dogs=[];
    var emojis=['🐕','🐩','🦮','🐕‍🦺','🐾','🐶'];
    var emoji=emojis[Math.floor(Math.random()*emojis.length)];
    var dog={name:name,breed:breed,age:age,color:color,emoji:emoji};
    if(weight>0)dog.weight=weight;
    c.dogs.push(dog);
    saveDB();
    logActivity('PET_CRIADO',name+' ('+breed+') — Cliente: '+c.name);
    toast('Pet '+name+' cadastrado!','success');
    closeModal();
    setTimeout(function(){
      openBathModal();
      setTimeout(function(){updateDogSelect(name)},200);
    },200);
  };

  window.updateDogSelect=function(selectedDog){
    var clientId=parseInt($('bClientId').value)||0;
    var sel=$('bDogName');
    sel.innerHTML='<option value="">Selecione o pet...</option>';
    if(!clientId)return;
    var c=DB.clients.find(function(x){return x.id===clientId});
    if(!c||!c.dogs)return;
    c.dogs.forEach(function(d){
      var opt=document.createElement('option');
      opt.value=d.name;
      opt.textContent=d.name+' ('+d.breed+')';
      if(selectedDog&&d.name===selectedDog)opt.selected=true;
      sel.appendChild(opt);
    });
  };
  window.updateBathPrice=function(){
    var sel=$('bService');
    if(!sel)return;
    var svc=DB.services.find(function(s){return s.name===sel.value});
    var price=svc?svc.price:0;
    var disp=$('bPriceDisplay');
    var input=$('bPrice');
    if(disp)disp.textContent=formatMoney(price);
    if(input)input.value=price||0;
  };
  window.updatePkgInfo=function(){
    var info=$('bPkgInfo');
    if(!info)return;
    var clientId=parseInt($('bClientId').value)||0;
    if(!clientId){info.innerHTML='';return}
    var available=(DB.clientPackages||[]).filter(function(p){
      return p.clientId===clientId&&p.active&&p.balance>0&&(!p.expiryDate||new Date(p.expiryDate)>=new Date());
    });
    if(available.length>0){
      var total=available.reduce(function(s,p){return s+p.balance},0);
      info.innerHTML='<div style="padding:8px 12px;background:rgba(46,213,115,.1);border:1px solid rgba(46,213,115,.3);border-radius:var(--r);margin-bottom:12px;font-size:13px;color:#2ed573"><i data-lucide="ticket" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i><strong>'+available.length+(available.length===1?' pacote ativo':' pacotes ativos')+'</strong> — Saldo total: <strong>'+formatMoney(total)+'</strong></div>';
    }else{
      info.innerHTML='<div style="padding:8px 12px;background:rgba(255,71,87,.08);border:1px solid rgba(255,71,87,.2);border-radius:var(--r);margin-bottom:12px;font-size:13px;color:#ff4757"><i data-lucide="alert-circle" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Cliente sem pacotes ativos</div>';
    }
    if(typeof lucide!=='undefined')lucide.createIcons();
  };

  window.updatePkgOptions=function(selectedId,allowAuto){
    var payment=$('bPayment')?$('bPayment').value:'';
    var pkgRow=$('bPkgRow');
    var pkgSel=$('bPackageId');
    var clientId=parseInt($('bClientId').value)||0;
    var svc=DB.services.find(function(s){return s.name===($('bService')?$('bService').value:'')});
    var servicePrice=svc?svc.price:0;
    if(payment!=='Pacote'&&allowAuto&&clientId&&servicePrice>0){
      var autoPkg=DB.clientPackages.find(function(p){
        return p.clientId===clientId&&p.active&&p.balance>0&&p.balance>=servicePrice&&(!p.expiryDate||new Date(p.expiryDate)>=new Date());
      });
      if(autoPkg){
        $('bPayment').value='Pacote';
        payment='Pacote';
        selectedId=autoPkg.id;
      }
    }
    if(payment==='Pacote'){
      pkgRow.style.display='block';
      pkgSel.innerHTML='<option value="">Selecione o pacote...</option>';
      var available=DB.clientPackages.filter(function(p){
        return p.clientId===clientId&&p.active&&p.balance>0&&(!p.expiryDate||new Date(p.expiryDate)>=new Date());
      });
      available.forEach(function(p){
        var opt=document.createElement('option');
        opt.value=p.id;
        opt.textContent='Pacote #'+p.id+' — Saldo '+formatMoney(p.balance);
        if(selectedId&&p.id===selectedId)opt.selected=true;
        pkgSel.appendChild(opt);
      });
      if(available.length===0){
        pkgSel.innerHTML='<option value="">Nenhum pacote disponivel</option>';
      }
    }else{
      pkgRow.style.display='none';
      pkgSel.innerHTML='<option value="">Selecione o pacote...</option>';
    }
  };

  window.saveBath=function(id){
    var clientId=parseInt($('bClientId').value)||0;
    var dogName=$('bDogName').value;
    var service=$('bService').value;
    var date=$('bDate').value;
    var professional=$('bProfessional').value;
    var paymentMethod=$('bPayment')?$('bPayment').value:'Dinheiro';
    var packageId=paymentMethod==='Pacote'?parseInt($('bPackageId').value)||null:null;
    var price=parseFloat($('bPrice').value)||0;
    var notes=$('bNotes').value.trim();
    if(!clientId){toast('Selecione o cliente!','error');return}
    if(!dogName){toast('Selecione o pet!','error');return}
    if(!date){toast('Selecione a data!','error');return}
    if(paymentMethod==='Pacote'){
      var pkg=DB.clientPackages.find(function(p){return p.id===packageId});
      if(!pkg){toast('Selecione um pacote valido!','error');return}
      var svc=DB.services.find(function(s){return s.name===service});
      price=svc?svc.price:0;
      if(price<=0){toast('Informe o valor!','error');return}
      if(pkg.balance<price){toast('Saldo insuficiente no pacote!','error');return}
      $('bPrice').value=price.toFixed(2);
    }else{
      if(price<=0){toast('Informe o valor!','error');return}
    }
    var data={clientId:clientId,dogName:dogName,service:service,date:new Date(date).toISOString(),professional:professional,price:price,notes:notes,paymentMethod:paymentMethod==='Pacote'?'Dinheiro':paymentMethod,packageId:packageId};
    if(id){
      var idx=DB.bathGrooming.findIndex(function(b){return b.id===id});
      if(idx!==-1){
        var oldBath=DB.bathGrooming[idx];
        data.status=oldBath.status;
        if(oldBath.packageId&&oldBath.creditDebited){
          var oldPkg=DB.clientPackages.find(function(p){return p.id===oldBath.packageId});
          if(oldPkg){
            oldPkg.balance=Math.round((oldPkg.balance+oldBath.price)*100)/100;
            oldPkg.usedAmount=Math.round((oldPkg.usedAmount-oldBath.price)*100)/100;
            oldBath.creditDebited=false;
            logActivity('PACOTE_ESTORNADO','Pacote #'+oldBath.packageId+' — '+formatMoney(oldBath.price)+' devolvidos (pacote alterado/removido)');
          }
        }
        if(data.packageId&&!data.creditDebited){
          var newPkg=DB.clientPackages.find(function(p){return p.id===data.packageId});
          if(newPkg&&newPkg.balance>=data.price){
            newPkg.balance=Math.round((newPkg.balance-data.price)*100)/100;
            newPkg.usedAmount=Math.round((newPkg.usedAmount+data.price)*100)/100;
            data.creditDebited=true;
          }
        }
        DB.bathGrooming[idx]=Object.assign(DB.bathGrooming[idx],data);
      }
      logActivity('BATH_EDITADO','Agendamento: '+dogName+' — '+service);
      toast('Agendamento atualizado!','success');
    }else{
      data.id=genId('bath');
      data.status='Agendado';
      if(paymentMethod==='Pacote'){
        var pkg=DB.clientPackages.find(function(p){return p.id===packageId});
        if(pkg){
          pkg.balance=Math.round((pkg.balance-price)*100)/100;
          pkg.usedAmount=Math.round((pkg.usedAmount+price)*100)/100;
        }
        data.creditDebited=true;
        logActivity('PACOTE_DEBITADO','Pacote #'+packageId+' — '+service+' — '+dogName+' — Debitado '+formatMoney(price)+' no agendamento — registrado como Dinheiro');
        logActivity('BATH_CRIADO','Agendamento: '+dogName+' — '+service+' — '+formatMoney(price)+' — Dinheiro (via Pacote #'+packageId+')');
        toast('Agendamento criado! Valor debitado do pacote — registrado como Dinheiro.','success');
      }else{
        data.creditDebited=false;
        logActivity('BATH_CRIADO','Agendamento: '+dogName+' — '+service+' — '+formatMoney(price)+' — '+paymentMethod);
        toast('Agendamento criado!','success');
      }
      DB.bathGrooming.push(data);
    }
    if(promotingWaitingId){
      DB.waitingList=DB.waitingList.filter(function(w){return w.id!==promotingWaitingId});
      logActivity('LISTA_ESPERA_PROMOVIDO','Item promovido para agendamento');
      promotingWaitingId=null;
    }
    saveDB();closeModal();renderBathGrooming($('mainContent'));
  };

  // Comprovante de banho e tosa
  window.printBathReceipt=function(id){
    var b=DB.bathGrooming.find(function(x){return x.id===id});
    if(!b)return;
    var client=DB.clients.find(function(c){return c.id===b.clientId});
    var co=getCompanyData();
    var coName=co?(co.fantasyName||co.name||'Empresa'):'PETSHOP PRADO';
    var html='<div class="receipt" id="bathReceiptContent">'+
      '<div class="r-header"><h3>'+coName+'</h3>'+
      '<p>Banho & Tosa — #'+b.id+'</p>'+
      '<p>'+formatDate(b.date)+'</p>'+
      '<p>Comprovante de Servico</p></div>'+
      '<hr class="r-divider">'+
      '<div class="r-item"><span>Cliente:</span><span>'+(client?client.name:'—')+'</span></div>'+
      '<div class="r-item"><span>Pet:</span><span>'+b.dogName+'</span></div>'+
      '<div class="r-item"><span>Servico:</span><span>'+b.service+'</span></div>'+
      '<div class="r-item"><span>Profissional:</span><span>'+b.professional+'</span></div>'+
      '<div class="r-item"><span>Pagamento:</span><span>'+(b.packageId?'Dinheiro (Pacote #'+b.packageId+')':(b.paymentMethod||'Dinheiro'))+'</span></div>'+
      (b.packageId?'<div class="r-item"><span>Debito:</span><span style="color:var(--success)">✓ '+formatMoney(b.price)+' debitados do pacote</span></div>':'')+
      '<hr class="r-divider">'+
      '<div class="r-total"><span>TOTAL</span><span>'+formatMoney(b.price)+'</span></div>'+
      '<hr class="r-divider">'+
      '<div class="r-item"><span>Status:</span><span>'+b.status+'</span></div>'+
      (b.notes?'<div class="r-item"><span>Obs:</span><span>'+b.notes+'</span></div>':'')+
      '<hr class="r-divider">'+
      '<div class="r-footer">Obrigado pela preferencia!<br>'+coName+'</div></div>';
    openModal('Comprovante — '+b.dogName,html,'<button class="btn btn-ghost" onclick="printBathReceiptWindow()"><i data-lucide="printer" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Imprimir</button><button class="btn btn-primary" onclick="closeModal()">Fechar</button>','modal-receipt');
  };
  window.printBathReceiptWindow=function(){
    var content=document.getElementById('bathReceiptContent');
    if(!content)return;
    smartPrint(content.innerHTML,{title:'Comprovante Banho & Tosa',width:70,fontSize:12});
  };

  // ===== SERVICES =====
  function renderServices(m){
    var activeServices=DB.services.filter(function(s){return s.active}).length;
    var avgPrice=DB.services.filter(function(s){return s.active}).reduce(function(s,v){return s+v.price},0)/(activeServices||1);
    var totalBaths=DB.bathGrooming.length;
    var usedServices={};
    DB.bathGrooming.forEach(function(b){usedServices[b.service]=(usedServices[b.service]||0)+1});
    var mostUsed=Object.keys(usedServices).sort(function(a,b){return usedServices[b]-usedServices[a]})[0]||'—';
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="concierge-bell" style="width:24px;height:24px;vertical-align:middle"></i> Cadastro de Servicos</h2><div class="header-actions">'+
      '<button class="btn btn-primary" onclick="openServiceModal()">+ Novo Servico</button>'+
      '</div></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="concierge-bell"></i></div><div class="sc-value">'+activeServices+'</div><div class="sc-label">Servicos Ativos</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="banknote"></i></div><div class="sc-value" style="color:var(--accent)">'+formatMoney(avgPrice)+'</div><div class="sc-label">Preco Medio</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="bath"></i></div><div class="sc-value">'+totalBaths+'</div><div class="sc-label">Agendamentos</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="star"></i></div><div class="sc-value" style="font-size:14px">'+mostUsed+'</div><div class="sc-label">Mais Utilizado</div></div>'+
      '</div>'+
      '<div class="table-wrap"><div class="table-header"><h3>'+DB.services.length+' servicos</h3>'+
      '<input type="text" class="table-search" id="serviceSearch" placeholder="Buscar servico..."></div>'+
      '<table><thead><tr><th>Nome</th><th>Preco</th><th>Duracao</th><th>Descricao</th><th>Agendamentos</th><th>Status</th><th>Acoes</th></tr></thead>'+
      '<tbody id="serviceTableBody"></tbody></table></div>';
    renderServiceTable();
    $('serviceSearch').addEventListener('input',renderServiceTable);
  }
  function renderServiceTable(){
    var search=($('serviceSearch')?$('serviceSearch').value:'').trim().toLowerCase();
    var items=DB.services.filter(function(s){return s.name.toLowerCase().includes(search)||(s.description&&s.description.toLowerCase().includes(search))});
    $('serviceTableBody').innerHTML=items.map(function(s){
      var usageCount=DB.bathGrooming.filter(function(b){return b.service===s.name}).length;
      return '<tr><td><strong>'+s.name+'</strong></td><td style="font-weight:700;color:var(--accent)">'+formatMoney(s.price)+'</td><td style="color:var(--txt2)">'+s.duration+' min</td><td style="color:var(--txt2);max-width:250px">'+(s.description||'—')+'</td><td><span class="badge-sm b-purple">'+usageCount+'</span></td><td>'+(s.active?'<span class="badge-sm b-green">Ativo</span>':'<span class="badge-sm b-red">Inativo</span>')+'</td><td><div class="action-btns"><button onclick="viewServiceDetails('+s.id+')" title="Ver Detalhes" style="background:rgba(30,144,255,.15);color:var(--blue)"><i data-lucide="eye" style="width:14px;height:14px"></i></button><button onclick="openServiceModal('+s.id+')" title="Editar"><i data-lucide="pencil" style="width:14px;height:14px"></i></button><button class="danger" onclick="toggleService('+s.id+')" title="'+(s.active?'Desativar':'Ativar')+'">'+(s.active?'⏻':'✓')+'</button><button class="danger" onclick="deleteService('+s.id+')" title="Excluir"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button></div></td></tr>';
    }).join('');
    if(items.length===0)$('serviceTableBody').innerHTML='<tr><td colspan="7" class="empty-msg">Nenhum servico encontrado</td></tr>';
  }
  window.openServiceModal=function(id){
    var s=id?DB.services.find(function(x){return x.id===id}):null;
    var body=pkField('service',id)+
      '<label>Nome do Servico</label><input type="text" id="sName" value="'+(s?s.name:'')+'" placeholder="Ex: Banho e Tosa Completa">'+
      '<label>Preco (R$)</label><input type="number" id="sPrice" step="0.01" min="0" value="'+(s?s.price:'')+'" placeholder="Ex: 120.00">'+
      '<label>Duracao (minutos)</label><input type="number" id="sDuration" min="5" step="5" value="'+(s?s.duration:'60')+'" placeholder="Ex: 60">'+
      '<label>Descricao</label><input type="text" id="sDescription" value="'+(s?s.description:'')+'" placeholder="Breve descricao do servico">';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveService('+(id?id:'null')+')">'+(s?'Salvar':'Adicionar')+'</button>';
    openModal(s?'Editar Servico':'Novo Servico',body,foot);
  };
  window.saveService=function(id){
    var data={
      name:$('sName').value.trim(),
      price:parseFloat($('sPrice').value)||0,
      duration:parseInt($('sDuration').value)||60,
      description:$('sDescription').value.trim(),
      active:true
    };
    if(!data.name){toast('Nome do servico obrigatorio!','error');return}
    if(data.price<=0){toast('Preco deve ser maior que zero!','error');return}
    if(id){
      var idx=DB.services.findIndex(function(s){return s.id===id});
      if(idx!==-1){
        var oldName=DB.services[idx].name;
        DB.services[idx]=Object.assign(DB.services[idx],data);
        if(oldName!==data.name){
          DB.bathGrooming.forEach(function(b){if(b.service===oldName)b.service=data.name});
        }
      }
      logActivity('SERVICO_EDITADO','Servico: '+data.name);
      toast('Servico atualizado!','success');
    }else{
      data.id=genId('service');
      DB.services.push(data);
      logActivity('SERVICO_CRIADO','Servico: '+data.name+' — '+formatMoney(data.price));
      toast('Servico adicionado!','success');
    }
    saveDB();closeModal();renderServiceTable();
  };
  window.toggleService=function(id){
    var s=DB.services.find(function(x){return x.id===id});
    s.active=!s.active;
    logActivity('SERVICO_STATUS',s.name+' — '+(s.active?'ativado':'desativado'));
    saveDB();renderServiceTable();
    toast(s.name+(s.active?' ativado':' desativado'),'info');
  };
  window.viewServiceDetails=function(id){
    var s=DB.services.find(function(x){return x.id===id});
    if(!s)return;
    var bathRecords=DB.bathGrooming.filter(function(b){return b.service===s.name});
    var usageCount=bathRecords.length;
    var revenue=bathRecords.reduce(function(t,b){return t+(b.status==='Cancelado'?0:(b.price||0))},0);
    var historyHtml='';
    if(usageCount>0){
      historyHtml='<table style="width:100%;font-size:12px;margin-top:8px"><thead><tr><th>Data</th><th>Pet</th><th>Cliente</th><th>Valor</th><th>Status</th></tr></thead><tbody>'+
        bathRecords.map(function(b){
          var sc=b.status==='Concluido'?'b-green':b.status==='Cancelado'?'b-red':'b-blue';
          var c=DB.clients.find(function(x){return x.id===b.clientId});
          return '<tr><td>'+formatDate(b.date)+'</td><td>'+b.dogName+'</td><td>'+(c?c.name:'—')+'</td><td style="font-weight:700">'+formatMoney(b.price)+'</td><td><span class="badge-sm '+sc+'">'+b.status+'</span></td></tr>';
        }).join('')+'</tbody></table>';
    }else{
      historyHtml='<div style="text-align:center;padding:12px;color:var(--txt2)">Nenhum agendamento registrado para este servico</div>';
    }
    var html=
      '<div style="text-align:center;margin-bottom:16px;padding:16px;background:var(--bg3);border-radius:var(--r)">'+
      '<div style="font-size:48px;margin-bottom:8px"><i data-lucide="concierge-bell" style="width:48px;height:48px"></i></div>'+
      '<div style="font-size:18px;font-weight:900;color:var(--accent)">'+s.name+'</div>'+
      (s.active?'<div style="margin-top:6px"><span class="badge-sm b-green">Ativo</span></div>':'<div style="margin-top:6px"><span class="badge-sm b-red">Inativo</span></div>')+
      '</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r)"><span style="color:var(--txt2);font-size:12px">Preco</span><div style="font-weight:900;font-size:18px;color:var(--accent)">'+formatMoney(s.price)+'</div></div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r)"><span style="color:var(--txt2);font-size:12px">Duracao</span><div style="font-weight:700">'+s.duration+' min</div></div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r)"><span style="color:var(--txt2);font-size:12px">Agendamentos</span><div style="font-weight:700">'+usageCount+'</div></div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r)"><span style="color:var(--txt2);font-size:12px">Faturamento (nao cancelados)</span><div style="font-weight:700;color:var(--accent)">'+formatMoney(revenue)+'</div></div>'+
      '</div>'+
      (s.description?'<div style="padding:12px;background:var(--bg3);border-radius:var(--r);margin-bottom:12px"><span style="color:var(--txt2);font-size:12px">Descricao</span><div style="font-size:13px;margin-top:4px">'+s.description+'</div></div>':'')+
      '<div style="margin-bottom:8px"><span style="font-weight:700"><i data-lucide="clipboard-list" style="width:16px;height:16px;vertical-align:middle"></i> Agendamentos deste servico</span></div>'+
      historyHtml;
    var foot='<button class="btn btn-ghost" onclick="closeModal();openServiceModal('+s.id+')"><i data-lucide="pencil" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Editar</button><button class="btn btn-primary" onclick="closeModal()">Fechar</button>';
    openModal('Servico — '+s.name,html,foot);
  };
  window.deleteService=function(id){
    var s=DB.services.find(function(x){return x.id===id});
    if(!s)return;
    var usageCount=DB.bathGrooming.filter(function(b){return b.service===s.name}).length;
    var pkgCount=DB.clientPackages.filter(function(p){return p.serviceName===s.name}).length;
    var msg='Excluir o servico "'+s.name+'"?';
    if(usageCount>0)msg+='\n\nAtencao: este servico ja possui '+usageCount+' agendamento(s) vinculado(s).';
    if(pkgCount>0)msg+='\nAtencao: '+pkgCount+' pacote(s) usam este servico.';
    msg+='\n\nEsta acao nao pode ser desfeita.';
    if(!confirm(msg))return;
    DB.services=DB.services.filter(function(x){return x.id!==id});
    logActivity('SERVICO_EXCLUIDO','Servico: '+s.name);
    saveDB();renderServices($('mainContent'));toast('Servico excluido!','success');
  };

  // ===== CLIENT PACKAGES (PACOTES) =====
  function renderPackages(m){
    var totalPackages=DB.clientPackages.length;
    var activePackages=DB.clientPackages.filter(function(p){return p.active&&p.balance>0}).length;
    var totalBalance=DB.clientPackages.reduce(function(s,p){return s+(p.balance||0)},0);
    var usedAmount=DB.clientPackages.reduce(function(s,p){return s+(p.usedAmount||0)},0);
    var totalRevenue=DB.clientPackages.reduce(function(s,p){return s+p.price},0);
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="ticket" style="width:24px;height:24px;vertical-align:middle"></i> Pacotes de Servicos</h2><div class="header-actions">'+
      '<button class="btn btn-primary" onclick="openPackageModal()">+ Novo Pacote</button>'+
      '</div></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="ticket"></i></div><div class="sc-value">'+activePackages+'</div><div class="sc-label">Pacotes Ativos</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="banknote"></i></div><div class="sc-value" style="color:var(--accent)">'+formatMoney(totalBalance)+'</div><div class="sc-label">Saldo Disponivel</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="bar-chart-3"></i></div><div class="sc-value">'+formatMoney(usedAmount)+'</div><div class="sc-label">Valor Utilizado</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="trending-up"></i></div><div class="sc-value" style="color:var(--accent)">'+formatMoney(totalRevenue)+'</div><div class="sc-label">Faturamento Pacotes</div></div>'+
      '</div>'+
      '<div class="table-wrap"><div class="table-header"><h3>'+totalPackages+' pacotes</h3>'+
      '<input type="text" class="table-search" id="pkgSearch" placeholder="Buscar pacote..."></div>'+
      '<table><thead><tr><th>Cliente</th><th>Servico</th><th>Saldo</th><th>Utilizado</th><th>Validade</th><th>Status</th><th>Acoes</th></tr></thead>'+
      '<tbody id="pkgTableBody"></tbody></table></div>';
    renderPackageTable();
    $('pkgSearch').addEventListener('input',renderPackageTable);
  }
  function renderPackageTable(){
    var search=($('pkgSearch')?$('pkgSearch').value:'').trim().toLowerCase();
    var items=DB.clientPackages.filter(function(p){
      var client=DB.clients.find(function(c){return c.id===p.clientId});
      var clientName=client?client.name.toLowerCase():'';
      return clientName.includes(search)||p.serviceName.toLowerCase().includes(search);
    });
    $('pkgTableBody').innerHTML=items.map(function(p){
      var client=DB.clients.find(function(c){return c.id===p.clientId});
      var remaining=p.balance||0;
      var used=p.usedAmount||0;
      var isExpired=p.expiryDate&&new Date(p.expiryDate)<new Date();
      var isEmpty=remaining<=0;
      var statusText=isEmpty?'Esgotado':isExpired?'Vencido':p.active?'Ativo':'Inativo';
      var statusClass=isEmpty?'b-red':isExpired?'b-yellow':p.active?'b-green':'b-red';
      var expiryFormatted=p.expiryDate?new Date(p.expiryDate).toLocaleDateString('pt-BR'):'Sem prazo';
      return '<tr><td><strong>'+(client?client.name:'—')+'</strong></td><td><span class="badge-sm b-purple">'+p.serviceName+'</span></td><td style="font-weight:700;color:'+(remaining>0?'var(--accent)':'var(--danger)')+'">'+formatMoney(remaining)+'</td><td style="font-weight:700;color:var(--txt2)">'+formatMoney(used)+'</td><td style="color:var(--txt2)">'+expiryFormatted+'</td><td><span class="badge-sm '+statusClass+'">'+statusText+'</span></td><td><div class="action-btns"><button onclick="viewPackageDetails('+p.id+')" title="Ver Detalhes" style="background:rgba(30,144,255,.15);color:var(--blue)"><i data-lucide="eye" style="width:14px;height:14px"></i></button><button onclick="openPackageModal('+p.id+')" title="Editar"><i data-lucide="pencil" style="width:14px;height:14px"></i></button><button class="danger" onclick="deletePackage('+p.id+')" title="Excluir"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button></div></td></tr>';
    }).join('');
    if(items.length===0)$('pkgTableBody').innerHTML='<tr><td colspan="7" class="empty-msg">Nenhum pacote encontrado</td></tr>';
  }
  window.openPackageModal=function(id){
    var p=id?DB.clientPackages.find(function(x){return x.id===id}):null;
    var activeClients=DB.clients.filter(function(c){return c.active});
    var activeServices=DB.services.filter(function(s){return s.active});
    var body=pkField('package',id)+
      '<label>Cliente</label><select id="pkgClientId">'+
      '<option value="">Selecione o cliente...</option>'+
      activeClients.map(function(c){return '<option value="'+c.id+'"'+(p&&p.clientId===c.id?' selected':'')+'>'+c.name+' ('+c.phone+')</option>'}).join('')+'</select>'+
      '<label>Valor do Pacote (R$)</label><input type="number" id="pkgPrice" step="0.01" min="0" value="'+(p?p.price:'')+'" placeholder="0.00">'+
      '<div style="font-size:12px;color:var(--txt2);margin-bottom:12px">Este valor sera o saldo inicial em dinheiro do pacote.</div>'+
      '<label>Data de Validade</label><input type="date" id="pkgExpiry" value="'+(p&&p.expiryDate?p.expiryDate.slice(0,10):'')+'">'+
      '<div style="font-size:12px;color:var(--txt2);margin-bottom:12px">Deixe vazio para pacote sem prazo de validade</div>'+
      '<label>Observacoes</label><input type="text" id="pkgNotes" value="'+(p&&p.notes?p.notes:'')+'" placeholder="Observacoes opcionais">';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="savePackage('+(id?id:'null')+')">'+(p?'Salvar':'Criar Pacote')+'</button>';
    openModal(p?'Editar Pacote':'Novo Pacote',body,foot);
  };
  window.savePackage=function(id){
    var clientId=parseInt($('pkgClientId').value)||0;
    var price=parseFloat($('pkgPrice').value)||0;
    var expiryDate=$('pkgExpiry').value;
    var notes=$('pkgNotes').value.trim();
    if(!clientId){toast('Selecione um cliente!','error');return}
    if(price<=0){toast('Valor do pacote deve ser maior que zero!','error');return}
    if(id){
      var idx=DB.clientPackages.findIndex(function(x){return x.id===id});
      if(idx!==-1){
        var used=DB.clientPackages[idx].usedAmount||0;
        DB.clientPackages[idx].clientId=clientId;
        DB.clientPackages[idx].price=price;
        DB.clientPackages[idx].usedAmount=used;
        DB.clientPackages[idx].balance=Math.max(0,Math.round((price-used)*100)/100);
        DB.clientPackages[idx].expiryDate=expiryDate?new Date(expiryDate+'T00:00:00').toISOString():null;
        DB.clientPackages[idx].notes=notes;
      }
      logActivity('PACOTE_EDITADO','Pacote #'+id+' — '+DB.clientPackages[idx].serviceName);
      toast('Pacote atualizado!','success');
    }else{
      var pkg={
        id:genId('package'),
        clientId:clientId,
        serviceName:'Pacote',
        price:price,
        balance:price,
        usedAmount:0,
        purchaseDate:new Date().toISOString(),
        expiryDate:expiryDate?new Date(expiryDate+'T00:00:00').toISOString():null,
        notes:notes,
        active:true
      };
      DB.clientPackages.push(pkg);
      var client=DB.clients.find(function(c){return c.id===clientId});
      logActivity('PACOTE_CRIADO','Pacote — '+formatMoney(price)+' — Cliente: '+(client?client.name:''));
      toast('Pacote criado com sucesso!','success');
    }
    saveDB();closeModal();renderPackageTable();
  };
  window.deletePackage=function(id){
    var p=DB.clientPackages.find(function(x){return x.id===id});
    if(p&&p.usedAmount>0){
      if(!confirm('Este pacote ja teve '+formatMoney(p.usedAmount)+' utilizados. Deseja excluir mesmo assim?'))return;
    }else{
      if(!confirm('Excluir este pacote?'))return;
    }
    DB.clientPackages=DB.clientPackages.filter(function(x){return x.id!==id});
    logActivity('PACOTE_EXCLUIDO','Pacote #'+id);
    saveDB();renderPackageTable();toast('Pacote excluido!','success');
  };
  window.viewPackageDetails=function(id){
    var p=DB.clientPackages.find(function(x){return x.id===id});
    if(!p)return;
    var client=DB.clients.find(function(c){return c.id===p.clientId});
    var remaining=p.balance||0;
    var used=p.usedAmount||0;
    var isExpired=p.expiryDate&&new Date(p.expiryDate)<new Date();
    var bathRecords=DB.bathGrooming.filter(function(b){return b.packageId===id});
    var historyHtml='';
    if(bathRecords.length>0){
      historyHtml='<table style="width:100%;font-size:12px;margin-top:8px"><thead><tr><th>Data</th><th>Pet</th><th>Valor</th><th>Status</th></tr></thead><tbody>'+
        bathRecords.map(function(b){
          var sc=b.status==='Concluido'?'b-green':b.status==='Cancelado'?'b-red':'b-blue';
          return '<tr><td>'+formatDate(b.date)+'</td><td>'+b.dogName+'</td><td style="font-weight:700">'+formatMoney(b.price)+'</td><td><span class="badge-sm '+sc+'">'+b.status+'</span></td></tr>';
        }).join('')+'</tbody></table>';
    }else{
      historyHtml='<div style="text-align:center;padding:12px;color:var(--txt2)">Nenhum uso registrado</div>';
    }
    var html=
      '<div style="text-align:center;margin-bottom:16px;padding:16px;background:var(--bg3);border-radius:var(--r)">'+
      '<div style="font-size:48px;margin-bottom:8px"><i data-lucide="ticket" style="width:48px;height:48px"></i></div>'+
      '<div style="font-size:18px;font-weight:900;color:var(--accent)">'+p.serviceName+'</div>'+
      '<div style="margin-top:4px;color:var(--txt2)">Pacote #'+p.id+'</div>'+
      '</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r)"><span style="color:var(--txt2);font-size:12px">Cliente</span><div style="font-weight:700">'+(client?client.name:'—')+'</div></div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r)"><span style="color:var(--txt2);font-size:12px">Valor Pago</span><div style="font-weight:700;color:var(--accent)">'+formatMoney(p.price)+'</div></div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r);text-align:center"><div style="font-size:24px;font-weight:900;color:var(--accent)">'+formatMoney(remaining)+'</div><div style="font-size:11px;color:var(--txt2)">Saldo</div></div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r);text-align:center"><div style="font-size:24px;font-weight:900">'+formatMoney(used)+'</div><div style="font-size:11px;color:var(--txt2)">Utilizado</div></div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r)"><span style="color:var(--txt2);font-size:12px">Validade</span><div style="font-weight:700">'+(p.expiryDate?new Date(p.expiryDate).toLocaleDateString('pt-BR'):'Sem prazo')+(isExpired?' <span style="color:var(--danger)">(Vencido)</span>':'')+'</div></div>'+
      '</div>'+
      (p.notes?'<div style="padding:12px;background:var(--bg3);border-radius:var(--r);margin-bottom:12px"><span style="color:var(--txt2);font-size:12px">Observacoes</span><div style="font-size:13px;margin-top:4px">'+p.notes+'</div></div>':'')+
      '<div style="margin-bottom:8px"><span style="font-weight:700"><i data-lucide="clipboard-list" style="width:16px;height:16px;vertical-align:middle"></i> Historico de Uso</span></div>'+
      historyHtml;
    var foot='<button class="btn btn-primary" onclick="closeModal()">Fechar</button>';
    openModal('Pacote — '+p.serviceName,html,foot);
  };

  // ===== SUPPLIERS / FORNECEDORES =====
  function renderSuppliers(m){
    var active=DB.suppliers.filter(function(s){return s.active}).length;
    var totalOrders=DB.supplierOrders.length;
    var pendingOrders=DB.supplierOrders.filter(function(o){return o.status==='Pendente'}).length;
    var totalSpent=DB.supplierOrders.filter(function(o){return o.status==='Recebido'}).reduce(function(s,o){return s+o.total},0);
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="truck" style="width:24px;height:24px;vertical-align:middle"></i> Fornecedores</h2><div class="header-actions">'+
      '<button class="btn btn-primary" onclick="openSupplierModal()"><i data-lucide="plus" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Novo Fornecedor</button>'+
      '</div></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="truck"></i></div><div class="sc-value">'+active+'</div><div class="sc-label">Fornecedores Ativos</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="shopping-bag"></i></div><div class="sc-value">'+totalOrders+'</div><div class="sc-label">Total de Pedidos</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="clock"></i></div><div class="sc-value" style="color:var(--warn)">'+pendingOrders+'</div><div class="sc-label">Pedidos Pendentes</div></div>'+
      '<div class="stat-card"><div class="sc-icon"><i data-lucide="banknote"></i></div><div class="sc-value" style="color:var(--accent)">'+formatMoney(totalSpent)+'</div><div class="sc-label">Total Gasto</div></div>'+
      '</div>'+
      '<div class="table-wrap"><div class="table-header"><h3>'+DB.suppliers.length+' fornecedores</h3>'+
      '<input type="text" class="table-search" id="supplierSearch" placeholder="Buscar fornecedor..."></div>'+
      '<table><thead><tr><th>Nome</th><th>CNPJ / CPF</th><th>Telefone</th><th>Email</th><th>Categoria</th><th>Status</th><th>Acoes</th></tr></thead>'+
      '<tbody id="supplierTableBody"></tbody></table></div>';
    renderSupplierTable();
    $('supplierSearch').addEventListener('input',renderSupplierTable);
  }
  function renderSupplierTable(){
    var search=($('supplierSearch')?$('supplierSearch').value:'').trim().toLowerCase();
    var items=DB.suppliers.filter(function(s){return s.name.toLowerCase().includes(search)||(s.cnpj&&s.cnpj.includes(search))||(s.category&&s.category.toLowerCase().includes(search))});
    $('supplierTableBody').innerHTML=items.map(function(s){
      return '<tr><td><strong>'+s.name+'</strong></td><td style="color:var(--txt2)">'+(s.cnpj||'—')+'</td><td style="color:var(--txt2)">'+(s.phone||'—')+'</td><td style="color:var(--txt2)">'+(s.email||'—')+'</td><td><span class="badge-sm b-purple">'+(s.category||'—')+'</span></td><td>'+(s.active?'<span class="badge-sm b-green">Ativo</span>':'<span class="badge-sm b-red">Inativo</span>')+'</td><td><div class="action-btns"><button onclick="openSupplierModal('+s.id+')" title="Editar"><i data-lucide="pencil" style="width:14px;height:14px"></i></button><button class="danger" onclick="toggleSupplier('+s.id+')" title="'+(s.active?'Desativar':'Ativar')+'">'+(s.active?'&#9212;':'&#10003;')+'</button><button class="danger" onclick="deleteSupplier('+s.id+')" title="Excluir"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button></div></td></tr>';
    }).join('');
    if(items.length===0)$('supplierTableBody').innerHTML='<tr><td colspan="7" class="empty-msg">Nenhum fornecedor encontrado</td></tr>';
  }
  window.openSupplierModal=function(id){
    var s=id?DB.suppliers.find(function(x){return x.id===id}):null;
    var categories=['Racao','Higiene','Acessorios','Saude','Brinquedos','Casas e Camas','Transporte','Roupas','Geral'];
    var body=pkField('supplier',id)+
      '<label>Nome / Razao Social</label><input type="text" id="supName" value="'+(s?s.name:'')+'" placeholder="Ex: PetFood Distribuidora">'+
      '<label>CNPJ / CPF</label><input type="text" id="supCnpj" value="'+(s?s.cnpj:'')+'" placeholder="00.000.000/0001-00">'+
      '<label>Telefone</label><input type="text" id="supPhone" value="'+(s?s.phone:'')+'" placeholder="(11) 99999-0000">'+
      '<label>Email</label><input type="email" id="supEmail" value="'+(s?s.email:'')+'" placeholder="contato@fornecedor.com">'+
      '<label>Endereco</label><input type="text" id="supAddress" value="'+(s?s.address:'')+'" placeholder="Rua, numero - Bairro - Cidade/UF">'+
      '<label>Categoria Principal</label><select id="supCategory">'+categories.map(function(c){return '<option'+(s&&s.category===c?' selected':'')+'>'+c+'</option>'}).join('')+'</select>'+
      '<label>Observacoes</label><input type="text" id="supNotes" value="'+(s?s.notes:'')+'" placeholder="Informacoes adicionais...">';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveSupplier('+(id?id:'null')+')">'+(s?'Salvar':'Adicionar')+'</button>';
    openModal(s?'Editar Fornecedor':'Novo Fornecedor',body,foot);
  };
  window.saveSupplier=function(id){
    var data={
      name:$('supName').value.trim(),
      cnpj:$('supCnpj').value.trim(),
      phone:$('supPhone').value.trim(),
      email:$('supEmail').value.trim(),
      address:$('supAddress').value.trim(),
      category:$('supCategory').value,
      notes:$('supNotes').value.trim(),
      active:true
    };
    if(!data.name){toast('Nome do fornecedor obrigatorio!','error');return}
    if(id){
      var idx=DB.suppliers.findIndex(function(s){return s.id===id});
      if(idx!==-1)DB.suppliers[idx]=Object.assign(DB.suppliers[idx],data);
      logActivity('FORNECEDOR_EDITADO','Fornecedor: '+data.name);
      toast('Fornecedor atualizado!','success');
    }else{
      data.id=genId('supplier');
      DB.suppliers.push(data);
      logActivity('FORNECEDOR_CADASTRADO','Fornecedor: '+data.name);
      toast('Fornecedor cadastrado!','success');
    }
    saveDB();closeModal();renderSuppliers($('mainContent'));
  };
  window.toggleSupplier=function(id){
    var s=DB.suppliers.find(function(x){return x.id===id});
    if(!s)return;
    s.active=!s.active;
    logActivity('FORNECEDOR_STATUS',s.name+' — '+(s.active?'Ativado':'Desativado'));
    saveDB();renderSuppliers($('mainContent'));
    toast('Fornecedor '+(s.active?'ativado':'desativado'),'info');
  };
  window.deleteSupplier=function(id){
    if(!hasFuncPermission('deleteSupplier')){toast('Sem permissao para excluir fornecedor!','error');return}
    var s=DB.suppliers.find(function(x){return x.id===id});
    if(!s)return;
    if(!confirm('Excluir o fornecedor "'+s.name+'"?'))return;
    DB.suppliers=DB.suppliers.filter(function(x){return x.id!==id});
    logActivity('FORNECEDOR_EXCLUIDO','Fornecedor: '+s.name);
    saveDB();renderSuppliers($('mainContent'));
    toast('Fornecedor excluido','info');
  };

  // ===== SUPPLIER ORDERS / PEDIDOS AO FORNECEDOR =====
  function renderSupplierOrders(m){
    var pending=DB.supplierOrders.filter(function(o){return o.status==='Pendente'}).length;
    var partial=DB.supplierOrders.filter(function(o){return o.status==='Recebido Parcial'}).length;
    var received=DB.supplierOrders.filter(function(o){return o.status==='Recebido'}).length;
    var cancelled=DB.supplierOrders.filter(function(o){return o.status==='Cancelado'}).length;
    var totalValue=DB.supplierOrders.reduce(function(s,o){return s+o.total},0);
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="shopping-bag" style="width:24px;height:24px;vertical-align:middle"></i> Pedidos ao Fornecedor</h2><div class="header-actions">'+
      '<button class="btn btn-primary" onclick="openSupplierOrderModal()"><i data-lucide="plus" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Novo Pedido</button>'+
      '</div></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card" style="cursor:pointer" onclick="filterSupplierOrders(\'Pendente\')"><div class="sc-icon"><i data-lucide="clock"></i></div><div class="sc-value" style="color:var(--warn)">'+pending+'</div><div class="sc-label">Pendentes</div></div>'+
      '<div class="stat-card" style="cursor:pointer" onclick="filterSupplierOrders(\'Recebido Parcial\')"><div class="sc-icon"><i data-lucide="loader"></i></div><div class="sc-value" style="color:var(--blue)">'+partial+'</div><div class="sc-label">Parcial</div></div>'+
      '<div class="stat-card" style="cursor:pointer" onclick="filterSupplierOrders(\'Recebido\')"><div class="sc-icon"><i data-lucide="check-circle"></i></div><div class="sc-value" style="color:var(--green)">'+received+'</div><div class="sc-label">Recebidos</div></div>'+
      '<div class="stat-card" style="cursor:pointer" onclick="filterSupplierOrders(\'Cancelado\')"><div class="sc-icon"><i data-lucide="x-circle"></i></div><div class="sc-value" style="color:var(--danger)">'+cancelled+'</div><div class="sc-label">Cancelados</div></div>'+
      '<div class="stat-card" style="cursor:pointer" onclick="filterSupplierOrders(\'todos\')"><div class="sc-icon"><i data-lucide="banknote"></i></div><div class="sc-value" style="color:var(--accent)">'+formatMoney(totalValue)+'</div><div class="sc-label">Total Geral</div></div>'+
      '</div>'+
      '<div class="table-wrap"><div class="table-header"><h3>'+DB.supplierOrders.length+' pedidos</h3>'+
      '<div style="display:flex;gap:8px;align-items:center">'+
      '<div id="supOrderFilterBtns" style="display:flex;gap:4px">'+
      '<button class="btn btn-sm active" onclick="filterSupplierOrders(\'todos\',this)" data-filter="todos">Todos</button>'+
      '<button class="btn btn-sm" onclick="filterSupplierOrders(\'Pendente\',this)" data-filter="Pendente">Pendente</button>'+
      '<button class="btn btn-sm" onclick="filterSupplierOrders(\'Recebido Parcial\',this)" data-filter="Recebido Parcial">Parcial</button>'+
      '<button class="btn btn-sm" onclick="filterSupplierOrders(\'Recebido\',this)" data-filter="Recebido">Recebido</button>'+
      '<button class="btn btn-sm" onclick="filterSupplierOrders(\'Cancelado\',this)" data-filter="Cancelado">Cancelado</button>'+
      '</div>'+
      '<input type="text" class="table-search" id="supOrderSearch" placeholder="Buscar pedido...">'+
      '</div></div>'+
      '<table><thead><tr><th>#</th><th>Fornecedor</th><th>Itens</th><th>Total</th><th>Data</th><th>Previsao</th><th>Status</th><th>Acoes</th></tr></thead>'+
      '<tbody id="supOrderTableBody"></tbody></table></div>';
    window._supOrderFilter='todos';
    renderSupplierOrderTable();
    $('supOrderSearch').addEventListener('input',renderSupplierOrderTable);
  }

  window.filterSupplierOrders=function(status,btn){
    window._supOrderFilter=status;
    var btns=document.querySelectorAll('#supOrderFilterBtns button');
    btns.forEach(function(b){b.classList.remove('active');if(b.dataset.filter===status)b.classList.add('active');});
    renderSupplierOrderTable();
  };
  function renderSupplierOrderTable(){
    var search=($('supOrderSearch')?$('supOrderSearch').value:'').trim().toLowerCase();
    var filter=window._supOrderFilter||'todos';
    var items=DB.supplierOrders.filter(function(o){
      if(filter!=='todos'&&o.status!==filter)return false;
      var sup=DB.suppliers.find(function(s){return s.id===o.supplierId});
      return (sup&&sup.name.toLowerCase().includes(search))||o.id.toString().includes(search)||(o.notes&&o.notes.toLowerCase().includes(search));
    });
    $('supOrderTableBody').innerHTML=items.map(function(o){
      var sup=DB.suppliers.find(function(s){return s.id===o.supplierId});
      var st=o.status==='Pendente'?'b-blue':o.status==='Recebido'?'b-green':o.status==='Recebido Parcial'?'b-purple':'b-red';
      var actions='<div class="action-btns">';
      actions+='<button onclick="viewSupplierOrder('+o.id+')" title="Ver Detalhes" style="background:rgba(30,144,255,.15);color:var(--blue)"><i data-lucide="eye" style="width:14px;height:14px"></i></button>';
      actions+='<button onclick="printSupplierOrder('+o.id+')" title="Imprimir" style="background:rgba(150,150,150,.15);color:var(--txt2)"><i data-lucide="printer" style="width:14px;height:14px"></i></button>';
      if(o.status==='Pendente'){
        actions+='<button onclick="editSupplierOrder('+o.id+')" title="Editar" style="background:rgba(255,193,7,.15);color:#f39c12"><i data-lucide="pencil" style="width:14px;height:14px"></i></button>';
        actions+='<button onclick="receiveSupplierOrder('+o.id+')" title="Receber" style="background:rgba(34,197,94,.15);color:var(--green)"><i data-lucide="check" style="width:14px;height:14px"></i></button>';
        actions+='<button onclick="cancelSupplierOrder('+o.id+')" title="Cancelar" style="background:rgba(255,71,87,.15);color:var(--danger)"><i data-lucide="x" style="width:14px;height:14px"></i></button>';
      }
      if(o.status==='Recebido Parcial'){
        actions+='<button onclick="partialReceiveSupplierOrder('+o.id+')" title="Receber Itens" style="background:rgba(34,197,94,.15);color:var(--green)"><i data-lucide="package-plus" style="width:14px;height:14px"></i></button>';
        actions+='<button onclick="cancelSupplierOrder('+o.id+')" title="Cancelar" style="background:rgba(255,71,87,.15);color:var(--danger)"><i data-lucide="x" style="width:14px;height:14px"></i></button>';
      }
      if(o.status==='Recebido'||o.status==='Cancelado'){
        actions+='<button onclick="reopenSupplierOrder('+o.id+')" title="Reabrir" style="background:rgba(156,39,176,.15);color:var(--purple)"><i data-lucide="rotate-ccw" style="width:14px;height:14px"></i></button>';
      }
      actions+='<button onclick="deleteSupplierOrder('+o.id+')" title="Excluir" style="background:rgba(255,71,87,.15);color:var(--danger)"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>';
      actions+='</div>';
      return '<tr><td>#'+o.id+'</td><td><strong>'+(sup?sup.name:'—')+'</strong></td><td>'+o.items.length+' itens</td><td style="font-weight:700;color:var(--accent)">'+formatMoney(o.total)+'</td><td style="color:var(--txt2)">'+formatDate(o.date)+'</td><td style="color:var(--txt2)">'+(o.expectedDate?new Date(o.expectedDate).toLocaleDateString('pt-BR'):'—')+'</td><td><span class="badge-sm '+st+'">'+o.status+'</span></td><td>'+actions+'</td></tr>';
    }).join('');
    if(items.length===0)$('supOrderTableBody').innerHTML='<tr><td colspan="8" class="empty-msg">Nenhum pedido encontrado</td></tr>';
  }
  window.openSupplierOrderModal=function(){
    if(DB.suppliers.filter(function(s){return s.active}).length===0){
      toast('Cadastre um fornecedor ativo primeiro!','error');return;
    }
    var supOpts=DB.suppliers.filter(function(s){return s.active}).map(function(s){return '<option value="'+s.id+'">'+s.name+'</option>'}).join('');
    var prodOpts=DB.products.map(function(p){return '<option value="'+p.id+'">'+p.emoji+' '+p.name+' ('+formatMoney(p.price)+')</option>'}).join('');
    var body=pkField('supplierorder',null)+
      '<label>Fornecedor</label><select id="soSupplier">'+supOpts+'</select>'+
      '<label>Data de Previsao de Entrega</label><input type="date" id="soExpectedDate">'+
      '<label>Observacoes</label><input type="text" id="soNotes" placeholder="Detalhes do pedido...">'+
      '<div style="margin-top:12px"><strong>Itens do Pedido</strong></div>'+
      '<div id="soItemsList" style="margin-top:8px"></div>'+
      '<button class="btn btn-ghost" style="margin-top:8px" onclick="addSupplierOrderItem()"><i data-lucide="plus" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Adicionar Item</button>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveSupplierOrder()">Criar Pedido</button>';
    openModal('Novo Pedido ao Fornecedor',body,foot);
    addSupplierOrderItem();
  };
  window.addSupplierOrderItem=function(){
    var prodOpts=DB.products.map(function(p){return '<option value="'+p.id+'">'+p.emoji+' '+p.name+'</option>'}).join('');
    var idx=document.querySelectorAll('#soItemsList .so-item-row').length;
    var html='<div class="so-item-row" style="display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:8px;align-items:end;margin-bottom:8px;padding:8px;background:var(--bg3);border-radius:var(--r)">'+
      '<div><label style="font-size:11px">Produto</label><select class="so-product">'+prodOpts+'</select></div>'+
      '<div><label style="font-size:11px">Qtd</label><input type="number" class="so-qty" min="1" value="1"></div>'+
      '<div><label style="font-size:11px">Preco Unit.</label><input type="number" class="so-price" step="0.01" min="0" placeholder="R$"></div>'+
      '<button class="btn btn-ghost danger" onclick="this.parentElement.remove()" title="Remover" style="margin-bottom:2px"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>'+
      '</div>';
    $('soItemsList').insertAdjacentHTML('beforeend',html);
    if(typeof lucide!=='undefined')lucide.createIcons();
  };
  window.saveSupplierOrder=function(){
    var supplierId=parseInt($('soSupplier').value);
    var expectedDate=$('soExpectedDate').value;
    var notes=$('soNotes').value.trim();
    var rows=document.querySelectorAll('#soItemsList .so-item-row');
    var items=[];
    var total=0;
    rows.forEach(function(row){
      var prodId=parseInt(row.querySelector('.so-product').value);
      var qty=parseInt(row.querySelector('.so-qty').value)||1;
      var price=parseFloat(row.querySelector('.so-price').value)||0;
      var prod=DB.products.find(function(p){return p.id===prodId});
      items.push({productId:prodId,productName:prod?prod.name:'Desconhecido',quantity:qty,unitPrice:price,subtotal:Math.round(qty*price*100)/100});
      total+=qty*price;
    });
    if(items.length===0){toast('Adicione pelo menos um item!','error');return}
    total=Math.round(total*100)/100;
    var order={
      id:genId('supplierorder'),
      supplierId:supplierId,
      items:items,
      total:total,
      date:new Date().toISOString(),
      expectedDate:expectedDate||null,
      notes:notes,
      status:'Pendente'
    };
    DB.supplierOrders.push(order);
    var sup=DB.suppliers.find(function(s){return s.id===supplierId});
    logActivity('PEDIDO_FORNECEDOR_CRIADO','Pedido #'+order.id+' — '+(sup?sup.name:'')+' — '+formatMoney(total));
    saveDB();closeModal();renderSupplierOrders($('mainContent'));
    toast('Pedido #'+order.id+' criado com sucesso!','success');
  };
  window.receiveSupplierOrder=function(id){
    if(!hasFuncPermission('receiveOrder')){toast('Sem permissao para receber pedido!','error');return}
    var o=DB.supplierOrders.find(function(x){return x.id===id});
    if(!o)return;
    var sup=DB.suppliers.find(function(s){return s.id===o.supplierId});
    var itemsHtml=o.items.map(function(item){
      var prod=DB.products.find(function(p){return p.id===item.productId});
      return '<tr><td>'+(prod?prod.emoji+' '+prod.name:item.productName)+'</td><td>'+item.quantity+'</td><td>'+formatMoney(item.unitPrice)+'</td><td>'+(prod?formatMoney(prod.price):'—')+'</td></tr>';
    }).join('');
    var body='<p style="font-size:13px;color:var(--txt2);margin-bottom:12px">Pedido de <strong>'+(sup?sup.name:'—')+'</strong> com '+o.items.length+' itens.</p>'+
      '<div class="table-wrap" style="margin-bottom:12px"><table><thead><tr><th>Produto</th><th>Qtd</th><th>Custo</th><th>Venda Atual</th></tr></thead><tbody>'+itemsHtml+'</tbody></table></div>'+
      '<div style="border-top:1px solid var(--border);padding-top:12px">'+
      '<label style="font-weight:700;color:var(--accent)">Atualizar precos ao receber?</label>'+
      '<div style="display:flex;gap:8px;margin-top:8px">'+
      '<label style="display:flex;align-items:center;gap:4px;cursor:pointer"><input type="radio" name="receivePriceUpdate" value="yes" checked> Sim, atualizar com markup</label>'+
      '<label style="display:flex;align-items:center;gap:4px;cursor:pointer"><input type="radio" name="receivePriceUpdate" value="no"> Nao, manter precos atuais</label>'+
      '</div>'+
      '<div id="receiveMarkupSection" style="margin-top:12px">'+
      '<label>Markup padrao (%)</label>'+
      '<input type="number" step="0.1" id="receiveMarkup" value="50" placeholder="Ex: 50 para 50%">'+
      '<div style="font-size:11px;color:var(--txt2);margin-top:4px">Preco de venda = Custo + (Custo x Markup%)</div>'+
      '</div></div>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="confirmReceiveSupplierOrder('+id+')">Confirmar Recebimento</button>';
    openModal('Receber Pedido #'+id,body,foot);
    setTimeout(function(){
      var radios=document.querySelectorAll('input[name="receivePriceUpdate"]');
      radios.forEach(function(r){r.addEventListener('change',function(){
        var section=$('receiveMarkupSection');
        if(section)section.style.display=r.value==='yes'?'block':'none';
      });});
    },100);
  };
  window.confirmReceiveSupplierOrder=function(id){
    var o=DB.supplierOrders.find(function(x){return x.id===id});
    if(!o)return;
    o.status='Recebido';
    o.receivedDate=new Date().toISOString();
    var updatePrices=false;
    var markup=0;
    var radio=document.querySelector('input[name="receivePriceUpdate"]:checked');
    if(radio&&radio.value==='yes'){
      updatePrices=true;
      markup=parseFloat($('receiveMarkup').value)||0;
    }
    var priceLog=[];
    o.items.forEach(function(item){
      var prod=DB.products.find(function(p){return p.id===item.productId});
      if(prod){
        prod.stock+=item.quantity;
        if(updatePrices&&item.unitPrice>0){
          var oldCost=prod.cost||0;
          var oldPrice=prod.price;
          prod.cost=item.unitPrice;
          prod.markup=markup;
          prod.price=Math.round((item.unitPrice+(item.unitPrice*markup/100))*100)/100;
          priceLog.push(prod.name+': '+formatMoney(oldPrice)+' → '+formatMoney(prod.price));
        }
      }
    });
    var sup=DB.suppliers.find(function(s){return s.id===o.supplierId});
    var logDetail='Pedido #'+id+' — '+(sup?sup.name:'')+' — Estoque atualizado';
    if(updatePrices&&priceLog.length>0) logDetail+=' | Precos: '+priceLog.join(', ');
    logActivity('PEDIDO_FORNECEDOR_RECEBIDO',logDetail);
    saveDB();closeModal();renderSupplierOrders($('mainContent'));refreshPDVPrices();
    toast('Pedido #'+id+' recebido!'+(updatePrices?' Precos atualizados!':''),'success');
  };
  window.cancelSupplierOrder=function(id){
    if(!hasFuncPermission('cancelOrder')){toast('Sem permissao para cancelar pedido!','error');return}
    var o=DB.supplierOrders.find(function(x){return x.id===id});
    if(!o)return;
    o.status='Cancelado';
    var sup=DB.suppliers.find(function(s){return s.id===o.supplierId});
    logActivity('PEDIDO_FORNECEDOR_CANCELADO','Pedido #'+id+' — '+(sup?sup.name:''));
    saveDB();renderSupplierOrders($('mainContent'));
    toast('Pedido #'+id+' cancelado','info');
  };
  window.viewSupplierOrder=function(id){
    var o=DB.supplierOrders.find(function(x){return x.id===id});
    if(!o)return;
    var sup=DB.suppliers.find(function(s){return s.id===o.supplierId});
    var st=o.status==='Pendente'?'b-blue':o.status==='Recebido'?'b-green':'b-red';
    var itemsHtml=o.items.map(function(it){
      return '<tr><td>'+it.productName+'</td><td style="text-align:center">'+it.quantity+'</td><td style="text-align:right">'+formatMoney(it.unitPrice)+'</td><td style="text-align:right;font-weight:700">'+formatMoney(it.subtotal)+'</td></tr>';
    }).join('');
    var html=
      '<div style="margin-bottom:16px;padding:12px;background:var(--bg3);border-radius:var(--r)">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'+
      '<div><strong>Fornecedor:</strong> '+(sup?sup.name:'—')+'</div>'+
      '<span class="badge-sm '+st+'">'+o.status+'</span>'+
      '</div>'+
      '<div style="font-size:13px;color:var(--txt2)">'+formatDate(o.date)+(o.expectedDate?' — Previsao: '+new Date(o.expectedDate).toLocaleDateString('pt-BR'):'')+'</div>'+
      (o.notes?'<div style="font-size:13px;color:var(--txt2);margin-top:4px">Obs: '+o.notes+'</div>':'')+
      '</div>'+
      '<table style="width:100%;font-size:13px"><thead><tr><th>Produto</th><th style="text-align:center">Qtd</th><th style="text-align:right">Preco Un.</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>'+
      itemsHtml+'</tbody></table>'+
      '<div style="text-align:right;margin-top:12px;font-size:16px;font-weight:900;color:var(--accent)">Total: '+formatMoney(o.total)+'</div>';
    var foot='<button class="btn btn-primary" onclick="closeModal()">Fechar</button>';
    openModal('Pedido #'+o.id,html,foot);
  };

  // ===== EDITAR PEDIDO =====
  window.editSupplierOrder=function(id){
    var o=DB.supplierOrders.find(function(x){return x.id===id});
    if(!o||o.status!=='Pendente')return;
    var sup=DB.suppliers.find(function(s){return s.id===o.supplierId});
    var supOpts=DB.suppliers.filter(function(s){return s.active}).map(function(s){
      return '<option value="'+s.id+'"'+(s.id===o.supplierId?' selected':'')+'>'+s.name+'</option>';
    }).join('');
    var itemsHtml=o.items.map(function(it,idx){
      var prodOpts=DB.products.map(function(p){
        return '<option value="'+p.id+'"'+(p.id===it.productId?' selected':'')+'>'+p.emoji+' '+p.name+'</option>';
      }).join('');
      return '<div class="so-item-row" style="display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:8px;align-items:end;margin-bottom:8px;padding:8px;background:var(--bg3);border-radius:var(--r)">'+
        '<div><label style="font-size:11px">Produto</label><select class="so-product">'+prodOpts+'</select></div>'+
        '<div><label style="font-size:11px">Qtd</label><input type="number" class="so-qty" min="1" value="'+it.quantity+'"></div>'+
        '<div><label style="font-size:11px">Preco Unit.</label><input type="number" class="so-price" step="0.01" min="0" value="'+it.unitPrice+'"></div>'+
        '<button class="btn btn-ghost danger" onclick="this.parentElement.remove()" title="Remover" style="margin-bottom:2px"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>'+
        '</div>';
    }).join('');
    var body=pkField('supplierorder',id)+
      '<label>Fornecedor</label><select id="esoSupplier">'+supOpts+'</select>'+
      '<label>Data de Previsao</label><input type="date" id="esoExpectedDate" value="'+(o.expectedDate||'')+'">'+
      '<label>Observacoes</label><input type="text" id="esoNotes" value="'+(o.notes||'')+'" placeholder="Detalhes...">'+
      '<div style="margin-top:12px"><strong>Itens do Pedido</strong></div>'+
      '<div id="esoItemsList" style="margin-top:8px">'+itemsHtml+'</div>'+
      '<button class="btn btn-ghost" style="margin-top:8px" onclick="addEditSupplierOrderItem()"><i data-lucide="plus" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Adicionar Item</button>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveEditSupplierOrder('+id+')">Salvar Alteracoes</button>';
    openModal('Editar Pedido #'+id,body,foot);
  };

  window.addEditSupplierOrderItem=function(){
    var prodOpts=DB.products.map(function(p){return '<option value="'+p.id+'">'+p.emoji+' '+p.name+'</option>'}).join('');
    var html='<div class="so-item-row" style="display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:8px;align-items:end;margin-bottom:8px;padding:8px;background:var(--bg3);border-radius:var(--r)">'+
      '<div><label style="font-size:11px">Produto</label><select class="so-product">'+prodOpts+'</select></div>'+
      '<div><label style="font-size:11px">Qtd</label><input type="number" class="so-qty" min="1" value="1"></div>'+
      '<div><label style="font-size:11px">Preco Unit.</label><input type="number" class="so-price" step="0.01" min="0" placeholder="R$"></div>'+
      '<button class="btn btn-ghost danger" onclick="this.parentElement.remove()" title="Remover" style="margin-bottom:2px"><i data-lucide="trash-2" style="width:14px;height:14px"></i></button>'+
      '</div>';
    $('esoItemsList').insertAdjacentHTML('beforeend',html);
    if(typeof lucide!=='undefined')lucide.createIcons();
  };

  window.saveEditSupplierOrder=function(id){
    var o=DB.supplierOrders.find(function(x){return x.id===id});
    if(!o)return;
    var supplierId=parseInt($('esoSupplier').value);
    var expectedDate=$('esoExpectedDate').value;
    var notes=$('esoNotes').value.trim();
    var rows=document.querySelectorAll('#esoItemsList .so-item-row');
    var items=[];
    var total=0;
    rows.forEach(function(row){
      var prodId=parseInt(row.querySelector('.so-product').value);
      var qty=parseInt(row.querySelector('.so-qty').value)||1;
      var price=parseFloat(row.querySelector('.so-price').value)||0;
      var prod=DB.products.find(function(p){return p.id===prodId});
      items.push({productId:prodId,productName:prod?prod.name:'Desconhecido',quantity:qty,unitPrice:price,subtotal:Math.round(qty*price*100)/100});
      total+=qty*price;
    });
    if(items.length===0){toast('Adicione pelo menos um item!','error');return}
    o.supplierId=supplierId;
    o.items=items;
    o.total=Math.round(total*100)/100;
    o.expectedDate=expectedDate||null;
    o.notes=notes;
    var sup=DB.suppliers.find(function(s){return s.id===supplierId});
    logActivity('PEDIDO_FORNECEDOR_EDITADO','Pedido #'+id+' — '+(sup?sup.name:'')+' — '+formatMoney(total));
    saveDB();closeModal();renderSupplierOrders($('mainContent'));
    toast('Pedido #'+id+' atualizado com sucesso!','success');
  };

  // ===== EXCLUIR PEDIDO =====
  window.deleteSupplierOrder=function(id){
    if(!hasFuncPermission('deleteOrder')){toast('Sem permissao para excluir pedido!','error');return}
    var o=DB.supplierOrders.find(function(x){return x.id===id});
    if(!o)return;
    if(!confirm('Excluir permanentemente o Pedido #'+id+'?\n\nEsta acao nao pode ser desfeita.'))return;
    DB.supplierOrders=DB.supplierOrders.filter(function(x){return x.id!==id});
    var sup=DB.suppliers.find(function(s){return s.id===o.supplierId});
    logActivity('PEDIDO_FORNECEDOR_EXCLUIDO','Pedido #'+id+' — '+(sup?sup.name:''));
    saveDB();renderSupplierOrders($('mainContent'));
    toast('Pedido #'+id+' excluido','info');
  };

  // ===== REABRIR PEDIDO =====
  window.reopenSupplierOrder=function(id){
    var o=DB.supplierOrders.find(function(x){return x.id===id});
    if(!o)return;
    var oldStatus=o.status;
    o.status='Pendente';
    delete o.receivedDate;
    delete o.partialItems;
    var sup=DB.suppliers.find(function(s){return s.id===o.supplierId});
    logActivity('PEDIDO_FORNECEDOR_REABERTO','Pedido #'+id+' — '+(sup?sup.name:'')+' — status: '+oldStatus+' → Pendente');
    saveDB();renderSupplierOrders($('mainContent'));
    toast('Pedido #'+id+' reaberto como Pendente','success');
  };

  // ===== RECEBIMENTO PARCIAL =====
  window.partialReceiveSupplierOrder=function(id){
    var o=DB.supplierOrders.find(function(x){return x.id===id});
    if(!o)return;
    var sup=DB.suppliers.find(function(s){return s.id===o.supplierId});
    var received=o.partialItems||[];
    var itemsHtml=o.items.map(function(it,idx){
      var rec=received.find(function(r){return r.productId===it.productId});
      var recQty=rec?rec.quantity:0;
      var pending=it.quantity-recQty;
      var prod=DB.products.find(function(p){return p.id===it.productId});
      return '<tr>'+
        '<td>'+(prod?prod.emoji+' '+prod.name:it.productName)+'</td>'+
        '<td style="text-align:center">'+it.quantity+'</td>'+
        '<td style="text-align:center;color:var(--green)">'+recQty+'</td>'+
        '<td style="text-align:center;font-weight:700;color:'+(pending>0?'var(--warn)':'var(--green)')+'">'+pending+'</td>'+
        '<td style="text-align:center"><input type="number" class="partial-qty" data-idx="'+idx+'" data-product-id="'+it.productId+'" min="0" max="'+pending+'" value="'+pending+'" style="width:60px;text-align:center"></td>'+
        '</tr>';
    }).join('');
    var body='<p style="font-size:13px;color:var(--txt2);margin-bottom:12px">Selecione a quantidade a receber de cada item do pedido de <strong>'+(sup?sup.name:'—')+'</strong>.</p>'+
      '<div class="table-wrap"><table><thead><tr><th>Produto</th><th>Total</th><th>Recebido</th><th>Pendente</th><th>Receber</th></tr></thead><tbody>'+itemsHtml+'</tbody></table></div>'+
      '<div style="margin-top:12px"><label>Markup (%) para atualizacao de precos</label>'+
      '<input type="number" step="0.1" id="partialMarkup" value="50" placeholder="Ex: 50 para 50%"></div>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="confirmPartialReceive('+id+')">Confirmar Recebimento</button>';
    openModal('Recebimento Parcial #'+id,body,foot);
  };

  window.confirmPartialReceive=function(id){
    var o=DB.supplierOrders.find(function(x){return x.id===id});
    if(!o)return;
    var markup=parseFloat($('partialMarkup').value)||0;
    var inputs=document.querySelectorAll('.partial-qty');
    var received=o.partialItems||[];
    var totalReceived=0;
    var totalItems=o.items.length;
    var priceLog=[];
    inputs.forEach(function(inp){
      var idx=parseInt(inp.dataset.idx);
      var productId=parseInt(inp.dataset.productId);
      var qty=parseInt(inp.value)||0;
      if(qty<=0)return;
      var item=o.items[idx];
      if(!item)return;
      var existing=received.find(function(r){return r.productId===productId});
      if(existing){existing.quantity+=qty;}else{received.push({productId:productId,quantity:qty});}
      totalReceived+=qty;
      var prod=DB.products.find(function(p){return p.id===productId});
      if(prod){
        prod.stock+=qty;
        if(item.unitPrice>0){
          var oldPrice=prod.price;
          prod.cost=item.unitPrice;
          prod.markup=markup;
          prod.price=Math.round((item.unitPrice+(item.unitPrice*markup/100))*100)/100;
          priceLog.push(prod.name+': '+formatMoney(oldPrice)+' → '+formatMoney(prod.price));
        }
      }
    });
    o.partialItems=received;
    var allComplete=o.items.every(function(it){
      var rec=received.find(function(r){return r.productId===it.productId});
      return rec&&rec.quantity>=it.quantity;
    });
    o.status=allComplete?'Recebido':'Recebido Parcial';
    if(allComplete)o.receivedDate=new Date().toISOString();
    var sup=DB.suppliers.find(function(s){return s.id===o.supplierId});
    var logDetail='Pedido #'+id+' — '+(sup?sup.name:'')+' — '+o.status;
    if(priceLog.length>0)logDetail+=' | Precos: '+priceLog.join(', ');
    logActivity('PEDIDO_FORNECEDOR_RECEBIDO',logDetail);
    saveDB();closeModal();renderSupplierOrders($('mainContent'));refreshPDVPrices();
    toast('Pedido #'+id+' — '+o.status+(priceLog.length>0?' Precos atualizados!':''),'success');
  };

  // ===== IMPRIMIR PEDIDO =====
  window.printSupplierOrder=function(id){
    var o=DB.supplierOrders.find(function(x){return x.id===id});
    if(!o)return;
    var sup=DB.suppliers.find(function(s){return s.id===o.supplierId});
    var itemsHtml=o.items.map(function(it){
      return '<tr><td>'+it.productName+'</td><td style="text-align:center">'+it.quantity+'</td><td style="text-align:right">'+formatMoney(it.unitPrice)+'</td><td style="text-align:right;font-weight:700">'+formatMoney(it.subtotal)+'</td></tr>';
    }).join('');
    var html='<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pedido #'+o.id+'</title>'+
      '<style>'+
      'body{font-family:Arial,sans-serif;padding:20px;color:#333}'+
      'h1{font-size:18px;margin-bottom:4px}'+
      'h2{font-size:14px;color:#666;font-weight:normal;margin-top:0}'+
      '.info{margin:16px 0;font-size:13px}'+
      '.info div{margin-bottom:4px}'+
      'table{width:100%;border-collapse:collapse;margin-top:12px;font-size:12px}'+
      'th,td{border:1px solid #ddd;padding:6px 8px}'+
      'th{background:#f5f5f5;text-align:left}'+
      '.total{text-align:right;font-size:16px;font-weight:bold;margin-top:12px}'+
      '.notes{margin-top:12px;font-size:12px;color:#666;border-top:1px solid #ddd;padding-top:8px}'+
      '@media print{body{padding:0}}'+
      '</style></head><body>'+
      '<h1>Pedido ao Fornecedor #'+o.id+'</h1>'+
      '<h2>'+(sup?sup.name:'—')+'</h2>'+
      '<div class="info">'+
      '<div><strong>Data:</strong> '+formatDate(o.date)+'</div>'+
      (o.expectedDate?'<div><strong>Previsao:</strong> '+new Date(o.expectedDate).toLocaleDateString('pt-BR')+'</div>':'')+
      '<div><strong>Status:</strong> '+o.status+'</div>'+
      '</div>'+
      '<table><thead><tr><th>Produto</th><th style="text-align:center">Qtd</th><th style="text-align:right">Preco Un.</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>'+
      itemsHtml+'</tbody></table>'+
      '<div class="total">Total: '+formatMoney(o.total)+'</div>'+
      (o.notes?'<div class="notes"><strong>Obs:</strong> '+o.notes+'</div>':'')+
      '</body></html>';
    var win=window.open('','_blank','width=600,height=400');
    win.document.write(html);win.document.close();win.print();
  };

  // ===== DATABASE CONFIG =====
  function renderDbConfig(m){
    var cfg=PetShopDB.config;
    var isRemote=cfg.type==='remote';
    var hasPw=cfg.hasPassword;
    var dataSize=(new Blob([JSON.stringify(PetShopDB.data)]).size/1024).toFixed(1);
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="database" style="width:24px;height:24px;vertical-align:middle"></i> Configuracao do Banco de Dados</h2></div>'+

      '<div class="settings-card">'+
      '<h3><i data-lucide="radio" style="width:18px;height:18px;vertical-align:middle"></i> Tipo de Armazenamento</h3>'+
      '<div style="display:flex;gap:12px;margin-top:12px">'+
      '<button class="btn '+(isRemote?'btn-ghost':'btn-primary')+'" id="dbTypeLocal" onclick="setDbType(\'local\')" style="flex:1;padding:16px">'+
      '<div style="font-size:24px;margin-bottom:6px">💻</div>'+
      '<div style="font-weight:700">Local (Navegador)</div>'+
      '<div style="font-size:11px;opacity:0.7;margin-top:4px">Dados salvos neste dispositivo</div>'+
      '</button>'+
      '<button class="btn '+(isRemote?'btn-primary':'btn-ghost')+'" id="dbTypeRemote" onclick="setDbType(\'remote\')" style="flex:1;padding:16px">'+
      '<div style="font-size:24px;margin-bottom:6px">🌐</div>'+
      '<div style="font-weight:700">Remoto (Servidor)</div>'+
      '<div style="font-size:11px;opacity:0.7;margin-top:4px">Sincronizar com API</div>'+
      '</button>'+
      '</div>'+
      '</div>'+

      (isRemote?
      '<div class="settings-card" id="dbRemoteUrlBlock">'+
      '<h3>🔗 URL do Servidor</h3>'+
      '<label>Endpoint da API</label>'+
      '<input type="text" id="dbRemoteUrl" value="'+(cfg.url||'')+'" placeholder="https://seudominio.com/api/petshopdb" style="font-family:monospace">'+
      '<div class="settings-hint">URL completa do endpoint que recebera POST para salvar e GET para carregar os dados.</div>'+
      '</div>':'')+

      '<div class="settings-card">'+
      '<h3>🔒 Protecao por Senha</h3>'+
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">'+
      '<label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px">'+
      '<input type="checkbox" id="dbEnablePw" '+(hasPw?'checked':'')+' onchange="toggleDbPassword()" style="width:18px;height:18px;accent-color:#a855f7">'+
      'Ativar criptografia do banco de dados'+
      '</label>'+
      '</div>'+
      '<div id="dbPwFields" style="display:'+(hasPw?'block':'none')+'">'+
      '<label>'+(hasPw?'Alterar Senha':'Nova Senha')+'</label>'+
      '<input type="password" id="dbNewPw" placeholder="Digite a senha">'+
      '<label>Confirmar Senha</label>'+
      '<input type="password" id="dbConfirmPw" placeholder="Repita a senha">'+
      '<div style="display:flex;align-items:center;gap:8px;margin-top:12px">'+
      '<input type="checkbox" id="dbRememberPw" '+(cfg.rememberPassword?'checked':'')+' style="width:18px;height:18px;accent-color:#a855f7">'+
      '<label for="dbRememberPw" style="font-size:13px;cursor:pointer">Lembrar senha neste dispositivo</label>'+
      '</div>'+
      '<div class="settings-hint">Os dados serao criptografados com XOR + Base64. A senha e necessaria toda vez que o sistema carregar.</div>'+
      '</div>'+
      '</div>'+

      '<div class="settings-card">'+
      '<h3><i data-lucide="bar-chart-3" style="width:18px;height:18px;vertical-align:middle"></i> Status Atual</h3>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">'+
      '<div><strong>Tipo:</strong> '+(isRemote?'Remoto (API)':'Local (localStorage)')+'</div>'+
      '<div><strong>Chave:</strong> <code style="background:var(--bg3);padding:2px 6px;border-radius:4px">'+cfg.key+'</code></div>'+
      '<div><strong>Criptografia:</strong> '+(hasPw?'<span style="color:#a855f7">Ativada</span>':'<span style="color:var(--warn)">Desativada</span>')+'</div>'+
      '<div><strong>Tamanho:</strong> '+dataSize+' KB</div>'+
      (isRemote?'<div style="grid-column:span 2"><strong>URL:</strong> <code style="background:var(--bg3);padding:2px 6px;border-radius:4px;font-size:11px">'+(cfg.url||'(nao configurado)')+'</code></div>':'')+
      '</div>'+
      '</div>'+

      '<div style="display:flex;gap:12px;margin-top:8px">'+
      '<button class="btn btn-primary" onclick="saveDbConfig()" style="flex:1">💾 Salvar Configuracao</button>'+
      '<button class="btn btn-ghost" onclick="renderDbConfig($('+"'mainContent'"+'))" style="flex:1">↩️ Restaurar Padrao</button>'+
      '</div>';
  }

  window.setDbType=function(type){
    var isRemote=(type==='remote');
    document.getElementById('dbTypeLocal').className='btn '+(isRemote?'btn-ghost':'btn-primary');
    document.getElementById('dbTypeRemote').className='btn '+(isRemote?'btn-primary':'btn-ghost');
    var existing=document.getElementById('dbRemoteUrlBlock');
    if(isRemote&&!existing){
      var card=document.querySelector('.settings-card');
      var refCard=card?card.nextElementSibling:card;
      var div=document.createElement('div');
      div.className='settings-card';
      div.id='dbRemoteUrlBlock';
      div.innerHTML=
        '<h3>🔗 URL do Servidor</h3>'+
        '<label>Endpoint da API</label>'+
        '<input type="text" id="dbRemoteUrl" value="'+(PetShopDB.config.url||'')+'" placeholder="https://seudominio.com/api/petshopdb" style="font-family:monospace">'+
        '<div class="settings-hint">URL completa do endpoint que recebera POST para salvar e GET para carregar os dados.</div>';
      if(refCard)refCard.parentNode.insertBefore(div,refCard);
    }else if(!isRemote&&existing){
      existing.remove();
    }
  };

  window.toggleDbPassword=function(){
    var cb=document.getElementById('dbEnablePw');
    var fields=document.getElementById('dbPwFields');
    if(cb&&fields)fields.style.display=cb.checked?'block':'none';
  };

  window.saveDbConfig=function(){
    var enablePw=document.getElementById('dbEnablePw');
    var newPw=document.getElementById('dbNewPw');
    var confirmPw=document.getElementById('dbConfirmPw');
    var rememberPw=document.getElementById('dbRememberPw');
    var remoteUrl=document.getElementById('dbRemoteUrl');

    var type=PetShopDB.config.type;
    var typeLocal=document.getElementById('dbTypeLocal');
    if(typeLocal&&typeLocal.className.indexOf('btn-primary')>=0)type='local';
    else type='remote';

    if(type==='remote'){
      var url=remoteUrl?remoteUrl.value.trim():'';
      if(!url){toast('Informe a URL do servidor!','error');return}
    }

    var password=undefined;
    if(enablePw&&enablePw.checked){
      var pw1=newPw?newPw.value:'';
      var pw2=confirmPw?confirmPw.value:'';
      if(!pw1){toast('Digite a nova senha!','error');return}
      if(pw1!==pw2){toast('As senhas nao conferem!','error');return}
      if(pw1.length<4){toast('A senha deve ter pelo menos 4 caracteres!','error');return}
      password=pw1;
    }else{
      password='';
    }

    var newConfig={
      type:type,
      key:PetShopDB.config.key,
      url:type==='remote'?(remoteUrl?remoteUrl.value.trim():''):'',
      password:password,
      rememberPassword:rememberPw?rememberPw.checked:false
    };

    PetShopDB.updateConfig(newConfig,function(err){
      if(err){
        toast('Erro ao salvar: '+err.message,'error');
        return;
      }
      toast('Configuracao do banco salva com sucesso!','success');
      logActivity('DB_CONFIG','Tipo: '+type+' | Criptografia: '+(enablePw&&enablePw.checked?'Sim':'Nao'));
      renderDbConfig($('mainContent'));
    });
  };

  // ===== COMPANY / EMPRESA =====
  function renderCompany(m){
    if(!DB.settings)DB.settings={};
    if(!DB.settings.company)DB.settings.company={};
    var c=DB.settings.company;
    var states=['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="building-2" style="width:24px;height:24px;vertical-align:middle"></i> Cadastro da Empresa</h2></div>'+

      '<div class="settings-card">'+
      '<h3><i data-lucide="clipboard-list" style="width:16px;height:16px;vertical-align:middle"></i> Dados Cadastrais</h3>'+

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'+

      '<div><label>Razao Social</label>'+
      '<input type="text" id="coName" value="'+(c.name||'')+'" placeholder="Ex: PetShop Prado LTDA"></div>'+

      '<div><label>Nome Fantasia</label>'+
      '<input type="text" id="coFantasy" value="'+(c.fantasyName||'')+'" placeholder="Ex: PetShop Prado"></div>'+

      '<div><label>CNPJ</label>'+
      '<input type="text" id="coCnpj" value="'+(c.cnpj||'')+'" placeholder="00.000.000/0001-00" maxlength="18" oninput="maskCNPJ(this)"></div>'+

      '<div><label>CPF (se PF)</label>'+
      '<input type="text" id="coCpf" value="'+(c.cpf||'')+'" placeholder="000.000.000-00" maxlength="14" oninput="maskCPF(this)"></div>'+

      '<div><label>Inscricao Estadual</label>'+
      '<input type="text" id="coIe" value="'+(c.ie||'')+'" placeholder="Numero da IE"></div>'+

      '<div><label>Inscricao Municipal</label>'+
      '<input type="text" id="coIm" value="'+(c.im||'')+'" placeholder="Numero da IM"></div>'+

      '</div></div>'+

      '<div class="settings-card">'+
      '<h3>📍 Endereco</h3>'+

      '<div style="display:grid;grid-template-columns:2fr 1fr;gap:16px">'+

      '<div><label>Logradouro</label>'+
      '<input type="text" id="coAddress" value="'+(c.address||'')+'" placeholder="Rua, Avenida, etc."></div>'+

      '<div><label>Numero</label>'+
      '<input type="text" id="coNumber" value="'+(c.number||'')+'" placeholder="123"></div>'+

      '</div>'+

      '<div style="display:grid;grid-template-columns:2fr 1fr;gap:16px">'+

      '<div><label>Complemento</label>'+
      '<input type="text" id="coComplement" value="'+(c.complement||'')+'" placeholder="Sala, Andar, etc."></div>'+

      '<div><label>Bairro</label>'+
      '<input type="text" id="coNeighborhood" value="'+(c.neighborhood||'')+'" placeholder="Bairro"></div>'+

      '</div>'+

      '<div style="display:grid;grid-template-columns:2fr 1fr 80px;gap:16px">'+

      '<div><label>Cidade</label>'+
      '<input type="text" id="coCity" value="'+(c.city||'')+'" placeholder="Cidade"></div>'+

      '<div><label>Estado</label>'+
      '<select id="coState"><option value="">UF</option>'+states.map(function(s){return '<option'+(c.state===s?' selected':'')+'>'+s+'</option>'}).join('')+'</select></div>'+

      '<div><label>CEP</label>'+
      '<input type="text" id="coZip" value="'+(c.zip||'')+'" placeholder="00000-000" maxlength="9" oninput="maskCEP(this)"></div>'+

      '</div></div>'+

      '<div class="settings-card">'+
      '<h3>📞 Contato</h3>'+

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'+

      '<div><label>Telefone Principal</label>'+
      '<input type="text" id="coPhone" value="'+(c.phone||'')+'" placeholder="(00) 00000-0000" maxlength="15" oninput="maskPhone(this)"></div>'+

      '<div><label>Telefone Secundario</label>'+
      '<input type="text" id="coPhone2" value="'+(c.phone2||'')+'" placeholder="(00) 00000-0000" maxlength="15" oninput="maskPhone(this)"></div>'+

      '<div><label>E-mail</label>'+
      '<input type="email" id="coEmail" value="'+(c.email||'')+'" placeholder="contato@empresa.com.br"></div>'+

      '<div><label>Website</label>'+
      '<input type="text" id="coWebsite" value="'+(c.website||'')+'" placeholder="www.empresa.com.br"></div>'+

      '</div></div>'+

      '<div class="settings-card">'+
      '<h3>💼 Dados do Negocio</h3>'+

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'+

      '<div><label>Ramo de Atividade</label>'+
      '<input type="text" id="coActivity" value="'+(c.activity||'')+'" placeholder="Ex: Pet Shop, Veterinaria, etc."></div>'+

      '<div><label>Frase / Slogan</label>'+
      '<input type="text" id="coMotto" value="'+(c.motto||'')+'" placeholder="Ex: Cuidando com amor desde 2020"></div>'+

      '</div>'+

      '<div><label>Logo da Empresa</label>'+
      '<div style="display:flex;gap:8px;align-items:center">'+
      '<input type="text" id="coLogo" value="'+(c.logo||'')+'" placeholder="https://exemplo.com/logo.png" style="flex:1">'+
      '<label class="btn btn-ghost" style="margin:0;white-space:nowrap;cursor:pointer;padding:10px 14px">📂 Upload'+
      '<input type="file" id="coLogoFile" accept="image/*" style="display:none" onchange="uploadLogoFile(this)">'+
      '</label>'+
      '</div>'+
      '<div class="settings-hint">URL da imagem ou faca upload. Aparece no login, sidebar e cupom.</div>'+
      (c.logo?'<div style="margin-top:8px"><img src="'+c.logo+'" alt="Logo" style="max-height:60px;border-radius:8px;border:1px solid var(--border)"></div>':'')+
      '</div>'+

      '<div><label>Texto abaixo da Logo</label>'+
      '<input type="text" id="coLogoSub" value="'+(c.logoSubtitle||'')+'" placeholder="Ex: PetShop & Estetica Animal">'+
      '<div class="settings-hint">Texto que aparece abaixo da logo no login e na sidebar. Deixe vazio para usar o padrao.</div>'+
      '</div></div>'+

      '<div class="settings-card">'+
      '<h3><i data-lucide="eye" style="width:14px;height:14px;vertical-align:middle"></i> Preview do Cupom</h3>'+
      '<div class="receipt" style="max-width:320px;margin:0 auto;font-size:11px;background:#fff;color:#333;padding:16px;border-radius:8px;border:1px solid #ddd">'+
      '<div class="r-header" style="text-align:center;border-bottom:1px dashed #ccc;padding-bottom:8px;margin-bottom:8px">'+
      (c.logo?'<img src="'+c.logo+'" style="max-height:40px;margin-bottom:4px"><br>':'')+
      '<h3 style="font-size:14px;margin:0">'+(c.fantasyName||c.name||'Nome da Empresa')+'</h3>'+
      (c.motto?'<p style="font-size:9px;color:#666;margin:2px 0">'+c.motto+'</p>':'')+
      (c.cnpj?'<p style="font-size:9px">CNPJ: '+c.cnpj+'</p>':'')+
      (c.cpf&&!c.cnpj?'<p style="font-size:9px">CPF: '+c.cpf+'</p>':'')+
      (c.address?'<p style="font-size:9px">'+c.address+(c.number?', '+c.number:'')+(c.neighborhood?' — '+c.neighborhood:'')+'</p>':'')+
      (c.city?'<p style="font-size:9px">'+c.city+' — '+(c.state||'')+(c.zip?' — '+c.zip:'')+'</p>':'')+
      (c.phone?'<p style="font-size:9px">'+c.phone+(c.phone2?' / '+c.phone2:'')+'</p>':'')+
      (c.email?'<p style="font-size:9px">'+c.email+'</p>':'')+
      '</div>'+
      '<div style="text-align:center;font-size:10px;color:#999">Cupom Nao Fiscal</div>'+
      '</div></div>'+

      '<button class="btn btn-primary" style="margin-top:16px;width:100%" onclick="saveCompany()">💾 Salvar Dados da Empresa</button>';
  }

  window.maskCNPJ=function(el){
    var v=el.value.replace(/\D/g,'').slice(0,14);
    v=v.replace(/^(\d{2})(\d)/,'$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/,'$1.$2.$3').replace(/\.(\d{3})(\d)/,'.$1/$2').replace(/(\d{4})(\d)/,'$1-$2');
    el.value=v;
  };
  window.maskCPF=function(el){
    var v=el.value.replace(/\D/g,'').slice(0,11);
    v=v.replace(/(\d{3})(\d)/,'$1.$2').replace(/(\d{3})\.(\d{3})(\d)/,'$1.$2.$3').replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/,'$1.$2.$3-$4');
    el.value=v;
  };
  window.maskCEP=function(el){
    var v=el.value.replace(/\D/g,'').slice(0,8);
    v=v.replace(/(\d{5})(\d)/,'$1-$2');
    el.value=v;
  };
  window.maskPhone=function(el){
    var v=el.value.replace(/\D/g,'').slice(0,11);
    if(v.length<=10)v=v.replace(/^(\d{2})(\d)/,'($1) $2').replace(/^(\d{2})\.(\d{3})(\d)/,'($1) $2').replace(/(\d{4})(\d)/,'$1-$2');
    else v=v.replace(/^(\d{2})(\d)/,'($1) $2').replace(/^(\d{5})(\d)/,'$1-$2');
    el.value=v;
  };

  window.uploadLogoFile=function(input){
    var file=input.files[0];
    if(!file)return;
    if(file.size>500*1024){toast('Imagem muito grande! Maximo 500KB.','error');return}
    var reader=new FileReader();
    reader.onload=function(e){
      var urlInput=document.getElementById('coLogo');
      if(urlInput)urlInput.value=e.target.result;
      toast('Imagem carregada! Clique em Salvar.','success');
    };
    reader.readAsDataURL(file);
  };

  function applyCompanyLogo(){
    var c=DB.settings&&DB.settings.company?DB.settings.company:{};
    var logo=c.logo||'';
    var name=c.fantasyName||c.name||'PetShop Prado';
    var slogan=c.logoSubtitle||c.motto||'Sistema de PetShop';

    var loginImg=document.getElementById('loginLogoImg');
    var loginText=document.getElementById('loginLogoText');
    var loginSub=document.getElementById('loginLogoSub');
    var sideImg=document.getElementById('sidebarLogoImg');
    var sideText=document.getElementById('sidebarLogoText');
    var sideSub=document.getElementById('sidebarLogoSub');

    if(logo){
      if(loginImg)loginImg.innerHTML='<img src="'+logo+'" alt="Logo">';
      if(loginText)loginText.textContent=name;
      if(loginSub)loginSub.textContent=slogan;
      if(sideImg)sideImg.innerHTML='<img src="'+logo+'" alt="Logo">';
      if(sideText)sideText.textContent=name;
      if(sideSub)sideSub.textContent=slogan;
    }else{
      if(loginImg)loginImg.innerHTML='';
      if(loginText)loginText.textContent='🐾 '+name;
      if(loginSub)loginSub.textContent=slogan;
      if(sideImg)sideImg.innerHTML='';
      if(sideText)sideText.textContent='🐾 '+name;
      if(sideSub)sideSub.textContent=slogan;
    }

    if(logo&&logo.indexOf('data:')===0){
      var link=document.querySelector("link[rel='icon']");
      if(link){link.href=logo;}
    }

    document.title=name;
  }

  window.applyCompanyLogo=applyCompanyLogo;

  applyCompanyLogo();

  window.saveCompany=function(){
    if(!DB.settings)DB.settings={};
    DB.settings.company={
      name:$('coName').value.trim(),
      fantasyName:$('coFantasy').value.trim(),
      cnpj:$('coCnpj').value.trim(),
      cpf:$('coCpf').value.trim(),
      ie:$('coIe').value.trim(),
      im:$('coIm').value.trim(),
      address:$('coAddress').value.trim(),
      number:$('coNumber').value.trim(),
      complement:$('coComplement').value.trim(),
      neighborhood:$('coNeighborhood').value.trim(),
      city:$('coCity').value.trim(),
      state:$('coState').value,
      zip:$('coZip').value.trim(),
      phone:$('coPhone').value.trim(),
      phone2:$('coPhone2').value.trim(),
      email:$('coEmail').value.trim(),
      website:$('coWebsite').value.trim(),
      activity:$('coActivity').value.trim(),
      logo:$('coLogo').value.trim(),
      logoSubtitle:$('coLogoSub').value.trim(),
      motto:$('coMotto').value.trim()
    };
    saveDB();
    logActivity('EMPRESA_SALVA','Dados da empresa atualizados');
    toast('Dados da empresa salvos com sucesso!','success');
    applyCompanyLogo();
    renderCompany($('mainContent'));
  };

  function getCompanyData(){
    if(!DB.settings||!DB.settings.company)return null;
    var c=DB.settings.company;
    if(!c.name&&!c.fantasyName&&!c.cnpj)return null;
    return c;
  }

  // ===== SETTINGS =====
  function renderSettings(m){
    if(!DB.settings)DB.settings={pixKey:'',pixName:'PetShop Prado',pixCity:'Sao Paulo'};
    var sc=getScaleCfg();
    var isUSB=sc.mode==='usb';
    var npCfg=getNetworkPrinterCfg();
    m.innerHTML=
      '<div class="page-header"><h2><i data-lucide="settings" style="width:24px;height:24px;vertical-align:middle"></i> Configuracoes</h2></div>'+

      '<div class="settings-card">'+
      '<h3><i data-lucide="smartphone" style="width:18px;height:18px;vertical-align:middle"></i> Configuracao PIX</h3>'+
      '<label>Chave PIX</label>'+
      '<input type="text" id="settPixKey" value="'+(DB.settings.pixKey||'')+'" placeholder="CPF, CNPJ, email, telefone ou chave aleatoria">'+
      '<div class="settings-hint">Insira sua chave PIX aceita pela instituicao. Pode ser CPF, CNPJ, e-mail, telefone ou chave aleatoria.</div>'+
      '<label>Nome que aparece no comprovante</label>'+
      '<input type="text" id="settPixName" value="'+(DB.settings.pixName||'')+'" placeholder="Ex: PetShop Prado LTDA">'+
      '<label>Cidade</label>'+
      '<input type="text" id="settPixCity" value="'+(DB.settings.pixCity||'')+'" placeholder="Ex: Sao Paulo">'+
      '<button class="btn btn-primary" style="margin-top:16px" onclick="saveSettings()">💾 Salvar Configuracoes PIX</button>'+
      (DB.settings.pixKey?'<div class="pix-preview"><div class="pp-label">Sua chave PIX configurada</div><div class="pp-key">'+DB.settings.pixKey+'</div></div>':'<div class="pix-preview" style="border-style:dashed"><div class="pp-label" style="color:var(--warn)">⚠️ Nenhuma chave PIX configurada. O pagamento PIX nao funcionara.</div></div>')+
      '</div>'+

      '<div class="settings-card">'+
      '<h3>⚖️ Configuracao da Balanca</h3>'+

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'+

      '<div><label>Modo de Conexao</label>'+
      '<select id="scMode" style="width:100%;padding:10px;border-radius:var(--r);border:1px solid var(--border);background:var(--bg2);color:var(--txt);font-size:13px" onchange="toggleScaleModeCfg()">'+
      '<option value="serial"'+(!isUSB?' selected':'')+'>Serial (RS-232)</option>'+
      '<option value="usb"'+(isUSB?' selected':'')+'>USB (Teclado)</option>'+
      '</select></div>'+

      '<div><label>Protocolo</label>'+
      '<select id="scProtocol" style="width:100%;padding:10px;border-radius:var(--r);border:1px solid var(--border);background:var(--bg2);color:var(--txt);font-size:13px">'+
      '<option value="toledo"'+(sc.protocol==='toledo'?' selected':'')+'>Toledo</option>'+
      '<option value="filizola"'+(sc.protocol==='filizola'?' selected':'')+'>Filizola</option>'+
      '<option value="generic"'+(sc.protocol==='generic'?' selected':'')+'>Generico (ASCII)</option>'+
      '</select></div>'+

      '</div>'+

      '<div id="scSerialFields" style="display:'+(isUSB?'none':'grid')+';grid-template-columns:1fr 1fr 1fr 1fr;gap:16px;margin-top:16px">'+

      '<div><label>Baud Rate</label>'+
      '<select id="scBaud" style="width:100%;padding:10px;border-radius:var(--r);border:1px solid var(--border);background:var(--bg2);color:var(--txt);font-size:13px">'+
      [2400,4800,9600,19200,38400].map(function(b){return '<option value="'+b+'"'+(sc.baudRate===b?' selected':'')+'>'+b+'</option>'}).join('')+
      '</select></div>'+

      '<div><label>Bits de Dados</label>'+
      '<select id="scDataBits" style="width:100%;padding:10px;border-radius:var(--r);border:1px solid var(--border);background:var(--bg2);color:var(--txt);font-size:13px">'+
      '<option value="7"'+(sc.dataBits===7?' selected':'')+'>7</option>'+
      '<option value="8"'+(sc.dataBits===8?' selected':'')+'>8</option>'+
      '</select></div>'+

      '<div><label>Bits de Parada</label>'+
      '<select id="scStopBits" style="width:100%;padding:10px;border-radius:var(--r);border:1px solid var(--border);background:var(--bg2);color:var(--txt);font-size:13px">'+
      '<option value="1"'+(sc.stopBits===1?' selected':'')+'>1</option>'+
      '<option value="2"'+(sc.stopBits===2?' selected':'')+'>2</option>'+
      '</select></div>'+

      '<div><label>Paridade</label>'+
      '<select id="scParity" style="width:100%;padding:10px;border-radius:var(--r);border:1px solid var(--border);background:var(--bg2);color:var(--txt);font-size:13px">'+
      '<option value="none"'+(sc.parity==='none'?' selected':'')+'>Nenhuma</option>'+
      '<option value="even"'+(sc.parity==='even'?' selected':'')+'>Par</option>'+
      '<option value="odd"'+(sc.parity==='odd'?' selected':'')+'>Impar</option>'+
      '</select></div>'+

      '</div>'+

      '<div id="scUsbInfo" style="display:'+(isUSB?'block':'none')+';margin-top:16px;padding:12px;background:var(--bg3);border-radius:var(--r);font-size:12px;color:var(--txt2)">'+
      '<i data-lucide="plug" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i> <strong>Modo USB (Teclado):</strong> A balanca envia o peso como se fosse digitado no teclado. Posicione o cursor no campo de peso e pese o produto. Se nao tiver balanca USB, digite o peso manualmente.'+
      '</div>'+

      '<div style="display:flex;gap:8px;margin-top:16px;align-items:center" id="scTestRow">'+
      '<button class="btn btn-ghost" onclick="testScaleConnection()" id="scTestBtn">🧪 Testar Conexao</button>'+
      '<span id="scTestResult" style="font-size:12px"></span>'+
      '</div>'+

      '<div style="display:flex;gap:12px;margin-top:16px">'+
      '<button class="btn btn-primary" onclick="saveScaleConfig()" style="flex:1">💾 Salvar Balanca</button>'+
      '<button class="btn btn-ghost" onclick="resetScaleConfig()" style="flex:1">↩️ Restaurar Padrao</button>'+
      '</div>'+
      '</div>'+

      '<div class="settings-card">'+
      '<h3><i data-lucide="printer" style="width:14px;height:14px;vertical-align:middle"></i> Configuracao da Impressora (ESC/POS)</h3>'+

      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r);margin-bottom:16px;font-size:12px;color:var(--txt2)">'+
      '<i data-lucide="plug" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i> A impressora termica conecta via USB/Serial usando protocolo ESC/POS. Funciona com impressorasenericas de cupom fiscal.'+
      '</div>'+

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'+

      '<div><label>Baud Rate</label>'+
      '<select id="prBaud" style="width:100%;padding:10px;border-radius:var(--r);border:1px solid var(--border);background:var(--bg2);color:var(--txt);font-size:13px">'+
      [2400,4800,9600,19200,38400,115200].map(function(b){
        var cfg=getPrinterCfg();
        return '<option value="'+b+'"'+((cfg.baudRate||9600)===b?' selected':'')+'>'+b+'</option>';
      }).join('')+
      '</select></div>'+

      '<div><label>Largura do Papel</label>'+
      '<select id="prWidth" style="width:100%;padding:10px;border-radius:var(--r);border:1px solid var(--border);background:var(--bg2);color:var(--txt);font-size:13px">'+
      '<option value="58"'+((getPrinterCfg().width||80)===58?' selected':'')+'>58mm (mini)</option>'+
      '<option value="80"'+((getPrinterCfg().width||80)===80?' selected':'')+'>80mm (padrao)</option>'+
      '</select></div>'+

      '</div>'+

      '<div style="display:flex;gap:8px;margin-top:16px;align-items:center">'+
      '<button class="btn btn-ghost" onclick="testPrinterConnection()" id="prTestBtn" style="white-space:nowrap">🧪 Testar Conexao</button>'+
      '<span id="prTestResult" style="font-size:12px"></span>'+
      '</div>'+

      '<div style="display:flex;gap:12px;margin-top:16px">'+
      '<button class="btn btn-primary" onclick="savePrinterConfig()" style="flex:1">💾 Salvar Impressora</button>'+
      '<button class="btn btn-ghost" onclick="resetPrinterConfig()" style="flex:1">↩️ Restaurar Padrao</button>'+
      '</div>'+

      '<div id="prStatus" style="margin-top:16px;padding:12px;background:var(--bg3);border-radius:var(--r);font-size:12px;color:var(--txt2)">'+
      'Status: '+(printerState.connected?'<span style="color:var(--success)"><span style="color:var(--success)">●</span> Conectada</span>':'<span style="color:var(--danger)"><span style="color:var(--danger)">●</span> Desconectada</span>')+
      (printerState.connected?' — Baud: '+printerState.baudRate:'')+
      '</div>'+

      '</div>'+

      '<div class="settings-card">'+
      '<h3>🌐 Impressora Compartilhada de Rede</h3>'+

      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r);margin-bottom:16px;font-size:12px;color:var(--txt2)">'+
      '<i data-lucide="printer" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i> Configure uma impressora compartilhada para que todos os dispositivos da rede possam imprimir. '+
      'A impressora deve estar compartilhada no Windows e acessivel pelo nome da maquina ou IP.'+
      '</div>'+

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">'+

      '<div><label>Tipo de Impressora</label>'+
      '<select id="npType" style="width:100%;padding:10px;border-radius:var(--r);border:1px solid var(--border);background:var(--bg2);color:var(--txt);font-size:13px" onchange="toggleNetworkPrinterType()">'+
      '<option value="shared"'+((DB.settings.networkPrinter||{}).type!=='ip'?' selected':'')+'>Compartilhada (\\MAQUINA\\Impressora)</option>'+
      '<option value="ip"'+((DB.settings.networkPrinter||{}).type==='ip'?' selected':'')+'>IP direto (Raw TCP/IP)</option>'+
      '</select></div>'+

      '<div><label>Porta</label>'+
      '<select id="npPort" style="width:100%;padding:10px;border-radius:var(--r);border:1px solid var(--border);background:var(--bg2);color:var(--txt);font-size:13px">'+
      '<option value="9100"'+(((DB.settings.networkPrinter||{}).port||9100)===9100?' selected':'')+'>9100 (padrao)</option>'+
      '<option value="9101"'+(((DB.settings.networkPrinter||{}).port||9100)===9101?' selected':'')+'>9101</option>'+
      '<option value="9102"'+(((DB.settings.networkPrinter||{}).port||9100)===9102?' selected':'')+'>9102</option>'+
      '</select></div>'+

      '</div>'+

      '<div id="npSharedFields" style="margin-top:16px">'+
      '<label>Nome da Impressora Compartilhada</label>'+
      '<input type="text" id="npName" value="'+((DB.settings.networkPrinter||{}).name||'')+'" placeholder="Ex: \\\\MAQUINA-PRINCIPAL\\ImpressoraTermica" style="width:100%;padding:10px;border-radius:var(--r);border:1px solid var(--border);background:var(--bg2);color:var(--txt);font-size:13px">'+
      '<div class="settings-hint">Use o formato \\\\NOME_DA_MAQUINA\\NOME_DA_IMPRESSORA. Para descobrir, va em Dispositivos e Impressoras no Windows.</div>'+
      '</div>'+

      '<div id="npIpFields" style="display:none;margin-top:16px">'+
      '<label>IP da Impressora</label>'+
      '<input type="text" id="npIp" value="'+((DB.settings.networkPrinter||{}).ip||'')+'" placeholder="Ex: 192.168.1.100" style="width:100%;padding:10px;border-radius:var(--r);border:1px solid var(--border);background:var(--bg2);color:var(--txt);font-size:13px">'+
      '</div>'+

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px">'+
      '<div><label>Largura do Papel</label>'+
      '<select id="npWidth" style="width:100%;padding:10px;border-radius:var(--r);border:1px solid var(--border);background:var(--bg2);color:var(--txt);font-size:13px">'+
      '<option value="58"'+(((DB.settings.networkPrinter||{}).width||80)===58?' selected':'')+'>58mm (mini)</option>'+
      '<option value="80"'+(((DB.settings.networkPrinter||{}).width||80)===80?' selected':'')+'>80mm (padrao)</option>'+
      '</select></div>'+
      '<div><label>Codificacao</label>'+
      '<select id="npEncoding" style="width:100%;padding:10px;border-radius:var(--r);border:1px solid var(--border);background:var(--bg2);color:var(--txt);font-size:13px">'+
      '<option value="utf8"'+(((DB.settings.networkPrinter||{}).encoding||'utf8')==='utf8'?' selected':'')+'>UTF-8</option>'+
      '<option value="latin1"'+(((DB.settings.networkPrinter||{}).encoding||'utf8')==='latin1'?' selected':'')+'>Latin-1</option>'+
      '</select></div>'+
      '</div>'+

      '<div style="display:flex;gap:8px;margin-top:16px;align-items:center">'+
      '<button class="btn btn-ghost" onclick="testNetworkPrinter()" id="npTestBtn" style="white-space:nowrap">🧪 Testar Impressora</button>'+
      '<span id="npTestResult" style="font-size:12px"></span>'+
      '</div>'+

      '<div style="display:flex;gap:12px;margin-top:16px">'+
      '<button class="btn btn-primary" onclick="saveNetworkPrinterConfig()" style="flex:1">💾 Salvar Impressora Rede</button>'+
      '<button class="btn btn-ghost" onclick="resetNetworkPrinterConfig()" style="flex:1">↩️ Restaurar Padrao</button>'+
      '</div>'+

      '<div id="npStatus" style="margin-top:16px;padding:12px;background:var(--bg3);border-radius:var(--r);font-size:12px;color:var(--txt2)">'+
      'Status: '+(DB.settings.networkPrinter&&DB.settings.networkPrinter.enabled?'<span style="color:var(--success)"><span style="color:var(--success)">●</span> Ativada</span>':'<span style="color:var(--danger)"><span style="color:var(--danger)">●</span> Desativada</span>')+
      (DB.settings.networkPrinter&&DB.settings.networkPrinter.enabled?' — '+(npCfg.type==='ip'?npCfg.ip+':'+npCfg.port:npCfg.name):'')+
      '</div>'+

      '<div style="display:flex;gap:8px;margin-top:16px;align-items:center">'+
      '<button class="btn btn-ghost" onclick="document.getElementById(\'npPrinterList\').style.display=document.getElementById(\'npPrinterList\').style.display===\'none\'?\'block\':\'none\';if(document.getElementById(\'npPrinterList\').style.display===\'block\')listPrinters()" style="font-size:12px"><i data-lucide="refresh-cw" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Listar impressoras do Windows</button>'+
      '<span id="npListResult" style="font-size:12px"></span>'+
      '</div>'+

      '<div id="npPrinterList" style="margin-top:8px;display:none">'+
      '<div id="npPrinters" style="padding:8px;background:var(--bg3);border-radius:var(--r);max-height:150px;overflow-y:auto;font-size:12px"></div>'+
      '</div>'+

      '</div>'+

      '<div class="settings-card">'+
      '<h3>ℹ️ Informacoes do Sistema</h3>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">'+
      '<div><strong>Versao:</strong> 2.0</div>'+
      '<div><strong>Produtos:</strong> '+DB.products.length+'</div>'+
      '<div><strong>Clientes:</strong> '+DB.clients.length+'</div>'+
      '<div><strong>Funcionarios:</strong> '+DB.employees.filter(function(e){return e.active}).length+' ativos</div>'+
      '<div><strong>Vendas:</strong> '+DB.sales.length+'</div>'+
      '<div><strong>Banho & Tosa:</strong> '+DB.bathGrooming.length+'</div>'+
      '</div></div>';

    // Ajustar visibilidade dos campos da impressora de rede
    setTimeout(function(){if(typeof toggleNetworkPrinterType==='function')toggleNetworkPrinterType()},50);
  }

  window.toggleScaleModeCfg=function(){
    var mode=document.getElementById('scMode').value;
    var serialFields=document.getElementById('scSerialFields');
    var usbInfo=document.getElementById('scUsbInfo');
    if(mode==='usb'){
      serialFields.style.display='none';
      usbInfo.style.display='block';
    }else{
      serialFields.style.display='grid';
      usbInfo.style.display='none';
    }
  };

  window.saveScaleConfig=function(){
    if(!DB.settings)DB.settings={};
    DB.settings.scale={
      mode:document.getElementById('scMode').value,
      protocol:document.getElementById('scProtocol').value,
      baudRate:parseInt(document.getElementById('scBaud').value)||9600,
      dataBits:parseInt(document.getElementById('scDataBits').value)||8,
      stopBits:parseInt(document.getElementById('scStopBits').value)||1,
      parity:document.getElementById('scParity').value||'none',
      unitDefault:'kg',
      stableTimeout:2000,
      decimals:3
    };
    saveDB();
    logActivity('SCALE_CONFIG','Balanca configurada — modo: '+DB.settings.scale.mode+' | protocolo: '+DB.settings.scale.protocol);
    toast('Configuracao da balanca salva!','success');
    renderSettings($('mainContent'));
  };

  window.resetScaleConfig=function(){
    if(!DB.settings)DB.settings={};
    DB.settings.scale={mode:'serial',protocol:'toledo',baudRate:9600,dataBits:8,stopBits:1,parity:'none',unitDefault:'kg',stableTimeout:2000,decimals:3};
    saveDB();
    toast('Balanca restaurada para padrao!','info');
    renderSettings($('mainContent'));
  };

  window.testScaleConnection=function(){
    var btn=document.getElementById('scTestBtn');
    var result=document.getElementById('scTestResult');
    if(!btn||!result)return;
    btn.disabled=true;
    btn.textContent='<i data-lucide="loader" style="width:14px;height:14px;vertical-align:middle"></i> Testando...';
    result.textContent='';
    var mode=document.getElementById('scMode').value;
    if(mode==='usb'){
      btn.disabled=false;
      btn.textContent='🧪 Testar Conexao';
      result.innerHTML='<span style="color:#a855f7">✓ Modo USB — digite um numero no campo de peso para testar</span>';
      return;
    }
    if(!navigator.serial){
      btn.disabled=false;
      btn.textContent='🧪 Testar Conexao';
      result.innerHTML='<span style="color:var(--warn)">⚠️ Web Serial nao suportado (use Chrome/Edge)</span>';
      return;
    }
    navigator.serial.requestPort().then(function(port){
      var baud=parseInt(document.getElementById('scBaud').value)||9600;
      return port.open({baudRate:baud,dataBits:parseInt(document.getElementById('scDataBits').value)||8,stopBits:parseInt(document.getElementById('scStopBits').value)||1,parity:document.getElementById('scParity').value||'none'}).then(function(){
        var decoder=new TextDecoderStream();
        var reader=decoder.readable.getReader();
        port.readable.pipeTo(decoder.writable);
        var timeout=setTimeout(function(){
          reader.cancel().catch(function(){});port.close().catch(function(){});
          btn.disabled=false;btn.textContent='🧪 Testar Conexao';
          result.innerHTML='<span style="color:var(--warn)">⚠️ Nenhum dado recebido em 3s. Verifique protocolo e conexao.</span>';
        },3000);
        reader.read().then(function(r){
          clearTimeout(timeout);
          reader.cancel().catch(function(){});port.close().catch(function(){});
          btn.disabled=false;btn.textContent='🧪 Testar Conexao';
          if(r.value){
            result.innerHTML='<span style="color:#a855f7">✓ Dados recebidos: <code>'+r.value.trim().substring(0,30)+'</code></span>';
          }else{
            result.innerHTML='<span style="color:var(--warn)">⚠️ Porta aberta mas sem dados. Verifique o protocolo.</span>';
          }
        }).catch(function(){
          clearTimeout(timeout);
          btn.disabled=false;btn.textContent='🧪 Testar Conexao';
          result.innerHTML='<span style="color:var(--warn)">⚠️ Nenhum dado recebido em 3s.</span>';
        });
      });
    }).catch(function(e){
      btn.disabled=false;
      btn.textContent='🧪 Testar Conexao';
      if(e.name!=='NotFoundError'){
        result.innerHTML='<span style="color:var(--warn)">⚠️ Erro: '+e.message+'</span>';
      }
    });
  };
  window.saveSettings=function(){
    if(!DB.settings)DB.settings={};
    DB.settings.pixKey=$('settPixKey').value.trim();
    DB.settings.pixName=$('settPixName').value.trim();
    DB.settings.pixCity=$('settPixCity').value.trim();
    logActivity('SETTINGS_SALVO','Configuracoes PIX atualizadas');
    saveDB();renderSettings($('mainContent'));
    toast('Configuracoes salvas!','success');
  };

  // ===== PRINTER CONFIG =====
  window.savePrinterConfig=function(){
    if(!DB.settings)DB.settings={};
    var baud=parseInt(document.getElementById('prBaud').value)||9600;
    var width=parseInt(document.getElementById('prWidth').value)||80;
    DB.settings.printer={baudRate:baud,width:width};
    printerState.baudRate=baud;
    logActivity('PRINTER_CONFIG','Impressora configurada — baud: '+baud+' — largura: '+width+'mm');
    saveDB();
    toast('Configuracao da impressora salva!','success');
    renderSettings($('mainContent'));
  };

  window.resetPrinterConfig=function(){
    if(!DB.settings)DB.settings={};
    DB.settings.printer={baudRate:9600,width:80};
    printerState.baudRate=9600;
    saveDB();
    toast('Impressora restaurada para padrao!','info');
    renderSettings($('mainContent'));
  };

  window.testPrinterConnection=async function(){
    var btn=document.getElementById('prTestBtn');
    var result=document.getElementById('prTestResult');
    if(!btn||!result)return;
    if(printerState.connected){
      result.innerHTML='<span style="color:var(--success)">✓ Ja conectada!</span>';
      return;
    }
    btn.disabled=true;
    btn.textContent='<i data-lucide="loader" style="width:14px;height:14px;vertical-align:middle"></i> Testando...';
    result.textContent='';
    try{
      var connected=await printerConnect();
      btn.disabled=false;
      btn.textContent='🧪 Testar Conexao';
      if(connected){
        result.innerHTML='<span style="color:var(--success)">✓ Conectada com sucesso!</span>';
        toast('Impressora conectada!','success');
      }else{
        result.innerHTML='<span style="color:var(--warn)">⚠️ Nao foi possivel conectar</span>';
      }
    }catch(e){
      btn.disabled=false;
      btn.textContent='🧪 Testar Conexao';
      result.innerHTML='<span style="color:var(--danger)">✕ Erro: '+e.message+'</span>';
    }
  };

  // ===== NETWORK PRINTER CONFIG =====
  function getNetworkPrinterCfg(){
    if(!DB.settings)DB.settings={};
    if(!DB.settings.networkPrinter)DB.settings.networkPrinter={type:'shared',name:'',port:9100,width:80,encoding:'utf8',enabled:false};
    return DB.settings.networkPrinter;
  }

  window.toggleNetworkPrinterType=function(){
    var type=document.getElementById('npType').value;
    var sharedFields=document.getElementById('npSharedFields');
    var ipFields=document.getElementById('npIpFields');
    if(type==='ip'){
      sharedFields.style.display='none';
      ipFields.style.display='block';
    }else{
      sharedFields.style.display='block';
      ipFields.style.display='none';
    }
  };

  window.saveNetworkPrinterConfig=function(){
    if(!DB.settings)DB.settings={};
    var type=document.getElementById('npType').value;
    var name=type==='shared'?document.getElementById('npName').value.trim():'';
    var ip=type==='ip'?document.getElementById('npIp').value.trim():'';
    var port=parseInt(document.getElementById('npPort').value)||9100;
    var width=parseInt(document.getElementById('npWidth').value)||80;
    var encoding=document.getElementById('npEncoding').value||'utf8';
    var enabled=!!(type==='shared'?name:ip);
    DB.settings.networkPrinter={type:type,name:name,ip:ip,port:port,width:width,encoding:encoding,enabled:enabled};
    logActivity('NETWORK_PRINTER_CONFIG','Impressora de rede configurada — tipo: '+type+' — nome: '+(name||ip));
    saveDB();
    toast('Configuracao da impressora de rede salva!','success');
    renderSettings($('mainContent'));
  };

  window.resetNetworkPrinterConfig=function(){
    if(!DB.settings)DB.settings={};
    DB.settings.networkPrinter={type:'shared',name:'',port:9100,width:80,encoding:'utf8',enabled:false};
    saveDB();
    toast('Impressora de rede restaurada para padrao!','info');
    renderSettings($('mainContent'));
  };

  window.testNetworkPrinter=async function(){
    var btn=document.getElementById('npTestBtn');
    var result=document.getElementById('npTestResult');
    if(!btn||!result)return;
    var type=document.getElementById('npType').value;
    var printerName=type==='shared'?document.getElementById('npName').value.trim():'';
    var ip=type==='ip'?document.getElementById('npIp').value.trim():'';
    if(type==='ip'&&ip){
      // Test IP connection
      btn.disabled=true;btn.textContent='<i data-lucide="loader" style="width:14px;height:14px;vertical-align:middle"></i> Testando...';result.textContent='';
      try{
        var resp=await fetch('http://'+ip+':'+(document.getElementById('npPort').value||'9100'),{method:'POST',body:'test',signal:AbortSignal.timeout(3000)});
        btn.disabled=false;btn.textContent='🧪 Testar Impressora';
        result.innerHTML='<span style="color:var(--success)">✓ IP acessivel!</span>';
      }catch(e){
        btn.disabled=false;btn.textContent='🧪 Testar Impressora';
        // Connection refused may still mean printer is there
        if(e.name==='TypeError'||e.name==='AbortError'){
          result.innerHTML='<span style="color:var(--warn)">⚠️ Nao foi possivel conectar ao IP. Verifique o endereco.</span>';
        }else{
          result.innerHTML='<span style="color:var(--danger)">✕ Erro: '+e.message+'</span>';
        }
      }
      return;
    }
    if(!printerName){
      result.innerHTML='<span style="color:var(--warn)">⚠️ Informe o nome da impressora</span>';
      return;
    }
    btn.disabled=true;btn.textContent='<i data-lucide="loader" style="width:14px;height:14px;vertical-align:middle"></i> Testando...';result.textContent='';
    try{
      var resp=await fetch('/api/network-printer-test',{method:'POST',headers:{'Content-Type':'application/json','x-auth-token':getAuthToken()},body:JSON.stringify({printerName:printerName})});
      var data=await resp.json();
      btn.disabled=false;btn.textContent='🧪 Testar Impressora';
      if(data.ok){
        result.innerHTML='<span style="color:var(--success)">✓ '+data.message+'</span>';
      }else{
        result.innerHTML='<span style="color:var(--warn)">⚠️ '+data.error+'</span>';
      }
    }catch(e){
      btn.disabled=false;btn.textContent='🧪 Testar Impressora';
      result.innerHTML='<span style="color:var(--danger)">✕ Erro: '+e.message+'</span>';
    }
  };

  window.listPrinters=async function(){
    var printersDiv=document.getElementById('npPrinters');
    var resultSpan=document.getElementById('npListResult');
    printersDiv.innerHTML='<i data-lucide="refresh-cw" style="width:14px;height:14px;vertical-align:middle"></i> Carregando...';
    resultSpan.textContent='';
    try{
      var resp=await fetch('/api/network-printers');
      var data=await resp.json();
      if(data.printers&&data.printers.length>0){
        printersDiv.innerHTML=data.printers.map(function(p){
          return '<div style="padding:6px 8px;margin:2px 0;background:var(--bg2);border-radius:4px;cursor:pointer" onclick="selectPrinter(\''+p.Name.replace(/\\/g,'\\\\')+'\')">'+
          '<strong>'+p.Name+'</strong><br>'+
          '<span style="color:var(--txt2);font-size:11px">'+p.DriverName+' | '+p.PortName+'</span>'+
          '</div>';
        }).join('');
        resultSpan.innerHTML='<span style="color:var(--success)">✓ '+data.printers.length+' impressora(s)</span>';
      }else{
        printersDiv.innerHTML='<div style="color:var(--warn);padding:8px">Nenhuma impressora encontrada</div>';
        resultSpan.innerHTML='<span style="color:var(--warn)">⚠️ Nenhuma impressora</span>';
      }
    }catch(e){
      printersDiv.innerHTML='<div style="color:var(--danger);padding:8px">Erro ao listar: '+e.message+'</div>';
      resultSpan.innerHTML='<span style="color:var(--danger)">✕ Erro</span>';
    }
  };

  window.selectPrinter=function(name){
    var npName=document.getElementById('npName');
    if(npName)npName.value=name;
    var listDiv=document.getElementById('npPrinterList');
    if(listDiv)listDiv.style.display='none';
    toast('Impressora selecionada: '+name,'info');
  };

  // ===== GENERATE PIX PAYLOAD (EMV Standard) =====
  function tlv(id,value){return id+value.length.toString().padStart(2,'0')+value}
  function generatePixPayload(chargeId,amount,merchantName,merchantCity,pixKey){
    var txId=chargeId.toString().padStart(12,'0').slice(0,12);
    var payload='';
    payload+=tlv('00','01');
    payload+=tlv('01','12');
    payload+=tlv('26',tlv('00','BR.GOV.BCB.PIX')+tlv('01',pixKey));
    payload+=tlv('52','0000');
    payload+=tlv('53','986');
    payload+=tlv('54',amount.toFixed(2));
    payload+=tlv('58','BR');
    payload+=tlv('59',merchantName.toUpperCase().slice(0,25));
    payload+=tlv('60',merchantCity.toUpperCase().slice(0,15));
    payload+=tlv('62',tlv('05',txId));
    payload+='6304';
    var dataToCrc=payload;
    var crc=0xFFFF;
    for(var i=0;i<dataToCrc.length;i++){
      crc^=dataToCrc.charCodeAt(i);
      for(var j=0;j<8;j++){
        crc=(crc&1)!==0?(crc>>>1)^0xA001:crc>>>1;
      }
    }
    payload+=crc.toString(16).toUpperCase().padStart(4,'0');
    return payload;
  }

  // ===== QR CODE MODAL FOR PIX =====
  var pixSaleForPrint=null;
  window.showPixQRCode=function(saleId){
    var sale=DB.sales.find(function(s){return s.id===saleId});
    if(!sale)return;
    pixSaleForPrint=sale;
    if(!DB.settings||!DB.settings.pixKey){
      toast('Configure sua chave PIX em Configuracoes!','error');
      return;
    }
    var co=getCompanyData();
    var pixPayload=generatePixPayload(sale.id,sale.total,DB.settings.pixName||(co?(co.fantasyName||co.name):''),DB.settings.pixCity||(co?(co.city||'SAO PAULO'):'SAO PAULO'),DB.settings.pixKey);
    var qrApiUrl='https://api.qrserver.com/v1/create-qr-code/?size=280x280&data='+encodeURIComponent(pixPayload)+'&bgcolor=ffffff&color=000000&margin=10';
    var html='<div class="qr-wrap">'+
      '<div class="qr-title">PIX — Pagamento Instantaneo</div>'+
      '<div class="qr-subtitle">Escaneie o QR Code ou copie a chave abaixo</div>'+
      '<img src="'+qrApiUrl+'" width="240" height="240" alt="QR Code PIX" />'+
      '<div class="qr-amount">'+formatMoney(sale.total)+'</div>'+
      '<div class="qr-pix-key" onclick="copyPixKey(this)" title="Clique para copiar">'+
      '<span class="copy-hint">CLIQUE PARA COPIAR</span>'+
      pixPayload+'</div>'+
      '<div class="qr-info">'+
      '<strong>Chave PIX:</strong> '+DB.settings.pixKey+'<br>'+
      '<strong>Recebedor:</strong> '+(DB.settings.pixName||(co?(co.fantasyName||co.name):''))+
      '</div>'+
      '<div class="qr-steps">'+
      '<div class="qr-step"><div class="step-num">1</div>Abra o app do banco</div>'+
      '<div class="qr-step"><div class="step-num">2</div>Escanear QR Code</div>'+
      '<div class="qr-step"><div class="step-num">3</div>Confirme o valor</div>'+
      '<div class="qr-step"><div class="step-num">4</div>Pagamento pronto!</div>'+
      '</div>'+
      '</div>'+
      '<div class="qr-info" style="margin-top:8px;padding:8px;background:var(--bg3);border-radius:var(--r);font-size:10px">'+
      'Venda #'+sale.id+' | '+formatDate(sale.date)+
      '</div>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Fechar</button>'+
      '<button class="btn btn-blue" onclick="copyPixKey(document.querySelector(\'.qr-pix-key\'))"><i data-lucide="clipboard" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Copiar Chave</button>'+
      '<button class="btn btn-primary" onclick="printPixQR()"><i data-lucide="printer" style="width:14px;height:14px;vertical-align:middle;margin-right:4px"></i>Imprimir</button>';
    openModal('Comprovante PIX — Venda #'+sale.id,html,foot,'qr-modal');
  };
  window.copyPixKey=function(el){
    var text=el.textContent.replace('CLIQUE PARA COPIAR','').trim();
    if(navigator.clipboard){navigator.clipboard.writeText(text).then(function(){toast('Chave PIX copiada!','success')}).catch(function(){toast('Nao foi possivel copiar a chave!','error')})}
    else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('Chave PIX copiada!','success')}
  };
  window.printPixQR=function(){
    var img=document.querySelector('.qr-wrap img');
    var amount=document.querySelector('.qr-amount');
    var pixKey=document.querySelector('.qr-pix-key');
    if(!img)return;
    var co=getCompanyData();
    var coName=co?(co.fantasyName||co.name||'Empresa'):'Empresa';
    var saleId=pixSaleForPrint?pixSaleForPrint.id:(DB.sales.length>0?DB.sales[DB.sales.length-1].id:'');
    var saleDate=pixSaleForPrint?pixSaleForPrint.date:null;
    var pixText=pixKey?pixKey.textContent.replace('CLIQUE PARA COPIAR','').trim():'';
    var printContent='========================================\n'+
      '          PIX — '+coName+'\n'+
      '========================================\n\n'+
      '  Escaneie o QR Code abaixo:\n\n'+
      '  [QR CODE: '+img.src.substring(0,50)+'...]\n\n'+
      '  Valor: '+(amount?amount.textContent:'')+'\n\n'+
      '  Chave PIX:\n'+
      '  '+pixText+'\n\n'+
      '----------------------------------------\n'+
      '  Venda: #'+saleId+'\n'+
      '  Data: '+(saleDate?formatDate(saleDate):formatDate(new Date()))+'\n'+
      '========================================\n';
    smartPrint(printContent,{title:'PIX',width:70,fontSize:11});
  };

  // ===== 5. EXPORT REPORT TXT =====
  window.exportReportTXT=function(){
    var activeSales=DB.sales.filter(function(s){return s.status!=='cancelado'});
    var totalRevenue=activeSales.reduce(function(s,v){return s+v.total},0);
    var totalExpenses=(DB.expenses||[]).reduce(function(s,e){return s+e.amount},0);
    var totalProfit=totalRevenue-totalExpenses;
    var avgTicket=activeSales.length>0?totalRevenue/activeSales.length:0;
    var paymentCounts={dinheiro:0,cartao:0,pix:0,debito:0};
    activeSales.forEach(function(s){
      if(s.payments&&s.payments.length>1){
        s.payments.forEach(function(p){if(paymentCounts[p.method]!==undefined)paymentCounts[p.method]++});
      }else if(paymentCounts[s.payment]!==undefined){
        paymentCounts[s.payment]++;
      }else{
        paymentCounts[s.payment]=(paymentCounts[s.payment]||0)+1;
      }
    });
    var topProducts={};
    activeSales.forEach(function(s){s.items.forEach(function(it){topProducts[it.name]=(topProducts[it.name]||0)+it.qty})});
    var sorted=Object.keys(topProducts).sort(function(a,b){return topProducts[b]-topProducts[a]}).slice(0,10);
    var co=getCompanyData();
    var coName=co?(co.fantasyName||co.name||'Empresa'):'PETSHOP PRADO';
    var coCnpj=co?(co.cnpj||co.cpf||''):'';
    var coAddr=co?(co.address+(co.number?', '+co.number:'')+(co.city?' — '+co.city+'/'+(co.state||''):'')):'';
    var txt='';
    txt+='========================================\n';
    txt+='       '+coName.toUpperCase()+' — RELATORIO FINANCEIRO\n';
    txt+='========================================\n';
    if(coCnpj)txt+='CNPJ: '+coCnpj+'\n';
    if(coAddr)txt+=coAddr+'\n';
    txt+='Data: '+new Date().toLocaleString('pt-BR')+'\n';
    txt+='Gerado por: '+(currentUser?currentUser.name:'')+'\n';
    txt+='----------------------------------------\n\n';
    txt+='RESUMO FINANCEIRO\n';
    txt+='----------------------------------------\n';
    txt+='Receita Total:    '+formatMoney(totalRevenue)+'\n';
    txt+='Despesas Total:   '+formatMoney(totalExpenses)+'\n';
    txt+='Lucro Liquido:    '+formatMoney(totalProfit)+'\n';
    txt+='Ticket Medio:     '+formatMoney(avgTicket)+'\n';
    txt+='Total de Vendas:  '+activeSales.length+'\n\n';
    txt+='FORMAS DE PAGAMENTO\n';
    txt+='----------------------------------------\n';
    var labels={dinheiro:'Dinheiro',cartao:'Credito',pix:'PIX',debito:'Debito'};
    Object.keys(paymentCounts).forEach(function(k){
      var pct=activeSales.length>0?((paymentCounts[k]/activeSales.length)*100).toFixed(1):0;
      txt+=(labels[k]||k).padEnd(12)+' '+String(paymentCounts[k]).padStart(5)+' vendas  ('+pct+'%)\n';
    });
    txt+='\nTOP 10 MAIS VENDIDOS\n';
    txt+='----------------------------------------\n';
    sorted.forEach(function(name,i){
      txt+=(i+1+'. ').padEnd(4)+name.padEnd(30)+' '+String(topProducts[name]).padStart(5)+' un\n';
    });
    if(DB.expenses&&DB.expenses.length>0){
      txt+='\nDESPESAS RECENTES\n';
      txt+='----------------------------------------\n';
      DB.expenses.slice(-10).forEach(function(e){
        txt+=e.name.padEnd(25)+e.category.padEnd(15)+formatMoney(e.amount).padStart(12)+'\n';
      });
    }
    txt+='\nPRODUTOS COM ESTOQUE BAIXO\n';
    txt+='----------------------------------------\n';
    DB.products.filter(function(p){return p.stock<=p.minStock}).forEach(function(p){
      txt+=p.emoji+' '+p.name.padEnd(30)+' Est: '+String(p.stock).padStart(4)+' '+p.unit+' (min: '+p.minStock+')\n';
    });
    txt+='\n========================================\n';
    txt+='       Relatorio gerado automaticamente\n';
    txt+='       '+coName+' - Sistema de PetShop\n';
    txt+='========================================\n';
    var blob=new Blob([txt],{type:'text/plain'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;a.download='relatorio-petshopprado-'+new Date().toISOString().slice(0,10)+'.txt';
    a.click();URL.revokeObjectURL(url);
    logActivity('RELATORIO_EXPORTADO','Relatorio TXT gerado');
    toast('Relatorio exportado em TXT!','success');
  };

  // ===== PERMISSOES DE USUARIO =====
  function renderPermissions(m){
    if(!DB.settings)DB.settings={};
    if(!DB.settings.userPermissions){
      DB.settings.userPermissions={
        admin:{dashboard:true,pdv:true,calculator:true,products:true,stock:true,expiryreport:true,employees:true,users:true,categories:true,pricetags:true,clients:true,bathgrooming:true,services:true,packages:true,sales:true,expenses:true,reports:true,company:true,activitylog:true,dbconfig:true,backup:true,settings:true,permissions:true,bulkpriceincrease:true},
        func:{dashboard:true,pdv:true,calculator:true,products:true,stock:true,expiryreport:true,employees:false,users:false,categories:true,pricetags:true,clients:true,bathgrooming:true,services:true,packages:true,sales:true,expenses:false,reports:false,company:false,activitylog:false,dbconfig:false,backup:false,settings:false,permissions:false,bulkpriceincrease:false},
        cliente:{dashboard:false,pdv:true,calculator:true,products:false,stock:false,expiryreport:false,employees:false,users:false,categories:false,pricetags:false,clients:false,bathgrooming:false,services:false,packages:false,sales:false,expenses:false,reports:false,company:false,activitylog:false,dbconfig:false,backup:false,settings:false,permissions:false,bulkpriceincrease:false}
      };
    }
    var perm=DB.settings.userPermissions;
    var allPages=[
      {id:'dashboard',icon:'layout-dashboard',label:'Dashboard'},
      {id:'pdv',icon:'shopping-cart',label:'PDV / Caixa'},
      {id:'calculator',icon:'calculator',label:'Calculadora'},
      {id:'products',icon:'package',label:'Produtos'},
      {id:'stock',icon:'clipboard-list',label:'Estoque'},
      {id:'expiryreport',icon:'calendar-clock',label:'Validade'},
      {id:'employees',icon:'users',label:'Funcionarios'},
      {id:'users',icon:'user',label:'Usuarios'},
      {id:'categories',icon:'tag',label:'Categorias'},
      {id:'pricetags',icon:'tag',label:'Etiquetas'},
      {id:'clients',icon:'user-round',label:'Clientes'},
      {id:'bathgrooming',icon:'bath',label:'Banho & Tosa'},
      {id:'services',icon:'concierge-bell',label:'Servicos'},
      {id:'packages',icon:'ticket',label:'Pacotes'},
      {id:'sales',icon:'banknote',label:'Vendas'},
      {id:'expenses',icon:'receipt',label:'Despesas'},
      {id:'reports',icon:'trending-up',label:'Relatorios'},
      {id:'company',icon:'building-2',label:'Empresa'},
      {id:'activitylog',icon:'file-text',label:'Log de Atividades'},
      {id:'dbconfig',icon:'database',label:'Banco de Dados'},
      {id:'backup',icon:'refresh-cw',label:'Backup / Restore'},
      {id:'settings',icon:'settings',label:'Configuracoes'},
      {id:'permissions',icon:'shield',label:'Permissoes'},
      {id:'bulkpriceincrease',icon:'trending-up',label:'Aumentar Preco (%)'}
    ];
    var types=[
      {id:'admin',label:'Administrador',color:'#ff4757',icon:'crown'},
      {id:'func',label:'Funcionario',color:'#6e9bff',icon:'briefcase'},
      {id:'cliente',label:'Cliente',color:'#2ed573',icon:'user-round'}
    ];
    var allFuncs=[
      {id:'exportBackup',icon:'download',label:'Exportar Backup'},
      {id:'importBackup',icon:'upload',label:'Importar Backup'},
      {id:'serverBackup',icon:'hard-drive',label:'Backup no Servidor'},
      {id:'restoreBackup',icon:'rotate-ccw',label:'Restaurar Backup'},
      {id:'deleteBackup',icon:'trash-2',label:'Deletar Backup'},
      {id:'exportStock',icon:'download',label:'Exportar Estoque'},
      {id:'importStock',icon:'upload',label:'Importar Estoque'},
      {id:'serverStockBackup',icon:'hard-drive',label:'Backup Estoque Servidor'},
      {id:'restoreStock',icon:'rotate-ccw',label:'Restaurar Estoque'},
      {id:'deleteStock',icon:'trash-2',label:'Deletar Backup Estoque'},
      {id:'exportSupplier',icon:'download',label:'Exportar Fornecedores'},
      {id:'importSupplier',icon:'upload',label:'Importar Fornecedores'},
      {id:'serverSupplierBackup',icon:'hard-drive',label:'Backup Fornecedores Servidor'},
      {id:'restoreSupplier',icon:'rotate-ccw',label:'Restaurar Fornecedores'},
      {id:'deleteSupplier',icon:'trash-2',label:'Deletar Backup Fornecedores'},
      {id:'bulkPriceIncrease',icon:'trending-up',label:'Aumentar Preco em Massa'},
      {id:'printLabels',icon:'printer',label:'Imprimir Etiquetas'},
      {id:'managePromos',icon:'tags',label:'Gerenciar Promocoes'},
      {id:'deleteProduct',icon:'trash-2',label:'Excluir Produto'},
      {id:'deleteClient',icon:'trash-2',label:'Excluir Cliente'},
      {id:'deleteEmployee',icon:'trash-2',label:'Excluir Funcionario'},
      {id:'deleteSupplier',icon:'trash-2',label:'Excluir Fornecedor'},
      {id:'deleteOrder',icon:'trash-2',label:'Excluir Pedido'},
      {id:'receiveOrder',icon:'check-circle',label:'Receber Pedido Fornecedor'},
      {id:'cancelOrder',icon:'x-circle',label:'Cancelar Pedido Fornecedor'},
      {id:'adjustStock',icon:'edit',label:'Ajustar Estoque'},
      {id:'restock',icon:'plus-circle',label:'Repor Estoque'},
      {id:'viewCostPrice',icon:'eye',label:'Ver Preco de Custo'},
      {id:'editCostPrice',icon:'pencil',label:'Editar Preco de Custo'}
    ];
    var html=
      '<div class="page-header"><h2><i data-lucide="shield" style="width:24px;height:24px;vertical-align:middle"></i> Permissoes de Acesso</h2>'+
      '<div class="header-actions"><button class="btn btn-primary" onclick="savePermissions()">Salvar Permissoes</button></div></div>'+
      '<p style="color:var(--txt2);margin-bottom:20px;font-size:14px">Configure quais paginas e funcoes cada tipo de usuario pode acessar. Apenas administradores podem alterar estas configuracoes.</p>';
    types.forEach(function(t){
      html+='<div class="settings-card" style="margin-bottom:20px;border-left:4px solid '+t.color+'">'+
        '<h3>'+t.icon+' '+t.label+'</h3>'+
        '<div style="font-size:12px;font-weight:700;color:var(--txt2);margin:8px 0 6px;text-transform:uppercase;letter-spacing:1px">Paginas</div>'+
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px">';
      allPages.forEach(function(p){
        var checked=perm[t.id]&&perm[t.id][p.id];
        html+='<label class="perm-toggle" style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--bg3);border-radius:var(--r);cursor:pointer;font-size:13px;'+(checked?'border:1px solid '+t.color+'30':'border:1px solid transparent')+'">'+
          '<input type="checkbox" class="perm-cb" data-type="'+t.id+'" data-page="'+p.id+'"'+(checked?' checked':'')+' style="accent-color:'+t.color+'">'+
          '<span>'+p.icon+' '+p.label+'</span></label>';
      });
      html+='</div>'+
        '<div style="font-size:12px;font-weight:700;color:var(--txt2);margin:16px 0 6px;text-transform:uppercase;letter-spacing:1px">Funcoes</div>'+
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px">';
      allFuncs.forEach(function(f){
        var checked=perm[t.id]&&perm[t.id][f.id];
        html+='<label class="perm-toggle" style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--bg3);border-radius:var(--r);cursor:pointer;font-size:13px;'+(checked?'border:1px solid '+t.color+'30':'border:1px solid transparent')+'">'+
          '<input type="checkbox" class="perm-func-cb" data-type="'+t.id+'" data-func="'+f.id+'"'+(checked?' checked':'')+' style="accent-color:'+t.color+'">'+
          '<span>'+f.icon+' '+f.label+'</span></label>';
      });
      html+='</div></div>';
    });
    m.innerHTML=html;
    document.querySelectorAll('.perm-cb').forEach(function(cb){
      cb.addEventListener('change',function(){
        var label=cb.closest('.perm-toggle');
        if(cb.checked){label.style.border='1px solid '+types.find(function(t){return t.id===cb.dataset.type}).color+'30'}
        else{label.style.border='1px solid transparent'}
      });
    });
    document.querySelectorAll('.perm-func-cb').forEach(function(cb){
      cb.addEventListener('change',function(){
        var label=cb.closest('.perm-toggle');
        if(cb.checked){label.style.border='1px solid '+types.find(function(t){return t.id===cb.dataset.type}).color+'30'}
        else{label.style.border='1px solid transparent'}
      });
    });
  }
  window.savePermissions=function(){
    if(!DB.settings)DB.settings={};
    if(!DB.settings.userPermissions)DB.settings.userPermissions={};
    var types=['admin','func','cliente'];
    types.forEach(function(t){
      if(!DB.settings.userPermissions[t])DB.settings.userPermissions[t]={};
      document.querySelectorAll('.perm-cb[data-type="'+t+'"]').forEach(function(cb){
        DB.settings.userPermissions[t][cb.dataset.page]=cb.checked;
      });
      document.querySelectorAll('.perm-func-cb[data-type="'+t+'"]').forEach(function(cb){
        DB.settings.userPermissions[t][cb.dataset.func]=cb.checked;
      });
    });
    saveDB();
    logActivity('PERMISSOES_SALVAS','Permissoes de acesso atualizadas para todos os tipos de usuario');
    toast('Permissoes salvas com sucesso!','success');
    buildSidebar();
  };

  // ===== BARCODE SCANNER =====
  var scannerState={active:false,callback:null,overlay:null,stream:null,animFrame:null};

  window.openBarcodeScanner=function(callbackTarget,inputId){
    if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){
      toast('Seu navegador nao suporta camera. Use Chrome.','error');
      return;
    }
    scannerState.callback=function(code){
      if(callbackTarget==='product'){
        var el=document.getElementById('pBarcode');
        if(el){el.value=code;toast('Codigo capturado: '+code,'success')}
      }else if(callbackTarget==='pdv'){
        var el=document.getElementById('barcodeInput');
        if(el){el.value=code;scanBarcode()}
      }else if(callbackTarget==='custom'&&inputId){
        var el=document.getElementById(inputId);
        if(el){el.value=code;toast('Codigo capturado: '+code,'success')}
      }
    };
    showScannerOverlay();
  };

  function showScannerOverlay(){
    if(scannerState.active)return;
    scannerState.active=true;
    var useNativeDetector='BarcodeDetector' in window;
    var overlay=document.createElement('div');
    overlay.className='scanner-overlay';
    overlay.id='barcodeScannerOverlay';
    if(useNativeDetector){
      overlay.innerHTML=
        '<div class="scanner-header">'+
        '<h3>Leitor de Codigo de Barras</h3>'+
        '<p>Posicione o codigo na area verde</p>'+
        '</div>'+
        '<div class="scanner-viewport" id="scannerViewport">'+
        '<video id="scannerVideo" autoplay playsinline muted></video>'+
        '<div class="scanner-line"></div>'+
        '</div>'+
        '<div class="scanner-result" id="scannerResult"></div>'+
        '<div class="scanner-actions">'+
        '<button class="scanner-btn scanner-btn-close" onclick="closeBarcodeScanner()">Fechar</button>'+
        '</div>';
    }else{
      overlay.innerHTML=
        '<div class="scanner-header">'+
        '<h3>Leitor de Codigo de Barras</h3>'+
        '<p>Posicione o codigo na area verde</p>'+
        '</div>'+
        '<div id="quaggaContainer" style="width:100%;max-width:400px;height:300px;border:3px solid var(--accent);border-radius:12px;overflow:hidden;background:#000"></div>'+
        '<div class="scanner-result" id="scannerResult"></div>'+
        '<div class="scanner-actions">'+
        '<button class="scanner-btn scanner-btn-close" onclick="closeBarcodeScanner()">Fechar</button>'+
        '</div>';
    }
    document.body.appendChild(overlay);
    scannerState.overlay=overlay;

    if(useNativeDetector){
      startNativeScanner();
    }else{
      startQuaggaScanner();
    }
  }

  // === BarcodeDetector nativo (Chrome Android) ===
  function startNativeScanner(){
    var video=document.getElementById('scannerVideo');
    var detector=null;
    try{
      detector=new BarcodeDetector({formats:['ean_13','ean_8','code_128','upc_a','upc_e']});
    }catch(e){
      console.warn('BarcodeDetector构造失败, usando Quagga:',e);
      startQuaggaScanner();
      return;
    }

    navigator.mediaDevices.getUserMedia({
      video:{facingMode:'environment',width:{ideal:1280},height:{ideal:720}},
      audio:false
    }).then(function(stream){
      scannerState.stream=stream;
      video.srcObject=stream;
      video.setAttribute('playsinline','true');
      video.play();

      var lastCode='';
      var lastTime=0;

      function detect(){
        if(!scannerState.active)return;
        if(video.readyState>=2){
          detector.detect(video).then(function(barcodes){
            if(barcodes&&barcodes.length>0){
              var code=barcodes[0].rawValue;
              var now=Date.now();
              if(code&&code.length>=4&&(code!==lastCode||now-lastTime>3000)){
                lastCode=code;
                lastTime=now;
                onBarcodeDetected(code);
                return;
              }
            }
          }).catch(function(){});
        }
        scannerState.animFrame=requestAnimationFrame(detect);
      }
      detect();
    }).catch(function(err){
      showScannerError(err);
    });
  }

  // === QuaggaJS fallback ===
  function startQuaggaScanner(){
    var container=document.getElementById('quaggaContainer');
    if(!container){
      showScannerError({message:'Container do scanner nao encontrado'});
      return;
    }
    var lastCode='';
    var lastTime=0;

    try{
      Quagga.init({
        inputStream:{
          name:'Live',
          type:'LiveStream',
          target:container,
          constraints:{facingMode:'environment',width:{ideal:1280},height:{ideal:720}}
        },
        decoder:{
          readers:['ean_reader','ean_8_reader','code_128_reader','code_39_reader','upc_reader','upc_e_reader']
        },
        locate:true,
        frequency:10
      },function(err){
        if(err){
          console.error('Quagga init error:',err);
          showScannerError({message:'Erro ao iniciar camera: '+(err.message||err)});
          return;
        }
        Quagga.start();
      });
    }catch(e){
      console.error('Quagga exception:',e);
      showScannerError({message:'Erro ao iniciar scanner: '+e.message});
      return;
    }

    Quagga.onDetected(function(result){
      if(!result||!result.codeResult)return;
      var code=result.codeResult.code;
      var now=Date.now();
      if(code&&code.length>=4&&(code!==lastCode||now-lastTime>3000)){
        lastCode=code;
        lastTime=now;
        onBarcodeDetected(code);
      }
    });
  }

  function showScannerError(err){
    var resultEl=document.getElementById('scannerResult');
    if(resultEl){
      resultEl.className='scanner-result error';
      if(err.name==='NotAllowedError')resultEl.textContent='Permissao da camera negada.';
      else if(err.name==='NotFoundError')resultEl.textContent='Nenhuma camera encontrada.';
      else resultEl.textContent='Erro: '+(err.message||err);
      resultEl.style.display='block';
    }
  }

  function onBarcodeDetected(code){
    var resultEl=document.getElementById('scannerResult');
    if(resultEl){
      resultEl.className='scanner-result found';
      resultEl.textContent=code;
      resultEl.style.display='block';
    }
    var prod=DB.products.find(function(p){return p.barcode===code});
    if(prod){toast(prod.emoji+' '+prod.name,'success')}
    else{toast('Codigo: '+code,'info')}
    var cb=scannerState.callback;
    setTimeout(function(){
      closeBarcodeScanner();
      if(cb)cb(code);
    },600);
  }

  window.closeBarcodeScanner=function(){
    scannerState.active=false;
    if(scannerState.animFrame){cancelAnimationFrame(scannerState.animFrame);scannerState.animFrame=null}
    if(scannerState.stream){
      scannerState.stream.getTracks().forEach(function(t){t.stop()});
      scannerState.stream=null;
    }
    try{Quagga.stop()}catch(e){}
    try{Quagga.CameraAccess.release()}catch(e){}
    scannerState.callback=null;
    if(scannerState.overlay){
      scannerState.overlay.remove();
      scannerState.overlay=null;
    }
  };

  // Expose navigateTo and closeModal to global scope
  window.navigateTo=navigateTo;
  window.closeModal=closeModal;

  // Initialize Lucide icons
  function initLucideIcons(){
    if(typeof lucide!=='undefined'&&typeof lucide.createIcons==='function'){
      try{lucide.createIcons();}catch(e){}
    }
  }
  // Init static icons on page load
  setTimeout(initLucideIcons,100);

})();
