(function(){
  // ===== DATA STORE =====
  var DB={
    products:[
      {id:1,name:'Racao Premium Cao Adulto 15kg',cat:'Alimentacao',price:189.90,stock:40,minStock:8,unit:'kg',barcode:'7891000001001',emoji:'🐕'},
      {id:2,name:'Racao Premium Gato Adulto 10kg',cat:'Alimentacao',price:159.90,stock:35,minStock:8,unit:'kg',barcode:'7891000001002',emoji:'🐱'},
      {id:3,name:'Racao Filhote Cao 8kg',cat:'Alimentacao',price:129.90,stock:30,minStock:6,unit:'kg',barcode:'7891000001003',emoji:'🐶'},
      {id:4,name:'Racao Filhote Gato 5kg',cat:'Alimentacao',price:99.90,stock:25,minStock:6,unit:'kg',barcode:'7891000001004',emoji:'🐈'},
      {id:5,name:'Racao Castrados Gato 5kg',cat:'Alimentacao',price:109.90,stock:30,minStock:6,unit:'kg',barcode:'7891000001005',emoji:'🐱'},
      {id:6,name:'Racao Senior Cao 12kg',cat:'Alimentacao',price:169.90,stock:20,minStock:5,unit:'kg',barcode:'7891000001006',emoji:'🐕'},
      {id:7,name:'Petisco Dental Cao 150g',cat:'Alimentacao',price:24.90,stock:60,minStock:10,unit:'g',barcode:'7891000001007',emoji:'🦴'},
      {id:8,name:'Petisco Gato Tubo 20g x6',cat:'Alimentacao',price:18.90,stock:80,minStock:12,unit:'un',barcode:'7891000001008',emoji:'🐟'},
      {id:9,name:'Ossinho Defumado 120g',cat:'Alimentacao',price:19.90,stock:50,minStock:10,unit:'g',barcode:'7891000001009',emoji:'🦴'},
      {id:10,name:'Sache Frango Gato 85g',cat:'Alimentacao',price:5.90,stock:200,minStock:30,unit:'g',barcode:'7891000001010',emoji:'🍗'},
      {id:11,name:'Sache Carne Gato 85g',cat:'Alimentacao',price:5.90,stock:180,minStock:30,unit:'g',barcode:'7891000001011',emoji:'🥩'},
      {id:12,name:'Shampoo Neutro Cao 500ml',cat:'Higiene',price:32.90,stock:40,minStock:8,unit:'ml',barcode:'7891000001012',emoji:'🧴'},
      {id:13,name:'Shampoo Antipulga 500ml',cat:'Higiene',price:39.90,stock:35,minStock:8,unit:'ml',barcode:'7891000001013',emoji:'🧴'},
      {id:14,name:'Condicionador Pet 500ml',cat:'Higiene',price:34.90,stock:30,minStock:6,unit:'ml',barcode:'7891000001014',emoji:'🧴'},
      {id:15,name:'Areia Sanitaria Silica 5kg',cat:'Higiene',price:29.90,stock:80,minStock:15,unit:'kg',barcode:'7891000001015',emoji:'🧱'},
      {id:16,name:'Areia Sanitaria Bentonita 10kg',cat:'Higiene',price:24.90,stock:60,minStock:12,unit:'kg',barcode:'7891000001016',emoji:'🧱'},
      {id:17,name:'Lençol Higienico Pet 30un',cat:'Higiene',price:22.90,stock:50,minStock:10,unit:'un',barcode:'7891000001017',emoji:'🧻'},
      {id:18,name:'Perfume Pet Spray 120ml',cat:'Higiene',price:28.90,stock:45,minStock:8,unit:'ml',barcode:'7891000001018',emoji:'🌸'},
      {id:19,name:'Colonia Pet 150ml',cat:'Higiene',price:25.90,stock:40,minStock:8,unit:'ml',barcode:'7891000001019',emoji:'💐'},
      {id:20,name:'Ovos de Cama Peludo',cat:'Higiene',price:19.90,stock:100,minStock:15,unit:'un',barcode:'7891000001020',emoji:'🥚'},
      {id:21,name:'Coleira Couro Pequena',cat:'Acessorios',price:49.90,stock:25,minStock:5,unit:'un',barcode:'7891000001021',emoji:'📿'},
      {id:22,name:'Coleira Couro Media',cat:'Acessorios',price:59.90,stock:25,minStock:5,unit:'un',barcode:'7891000001022',emoji:'📿'},
      {id:23,name:'Coleira Couro Grande',cat:'Acessorios',price:69.90,stock:20,minStock:5,unit:'un',barcode:'7891000001023',emoji:'📿'},
      {id:24,name:'Guia de Passeio Retractil',cat:'Acessorios',price:44.90,stock:30,minStock:6,unit:'un',barcode:'7891000001024',emoji:'🔗'},
      {id:25,name:'Peitoral Gato Escapulario',cat:'Acessorios',price:39.90,stock:20,minStock:5,unit:'un',barcode:'7891000001025',emoji:'🐱'},
      {id:26,name:'Bolinha de Silicone',cat:'Brinquedos',price:14.90,stock:100,minStock:15,unit:'un',emoji:'⚽'},
      {id:27,name:'Ratinho de Pelucia x3',cat:'Brinquedos',price:22.90,stock:60,minStock:10,unit:'un',emoji:'🐭'},
      {id:28,name:'Corda Trançada Cao',cat:'Brinquedos',price:29.90,stock:45,minStock:8,unit:'un',emoji:'🪢'},
      {id:29,name:'Varinha com Pena',cat:'Brinquedos',price:19.90,stock:50,minStock:8,unit:'un',emoji:'🪶'},
      {id:30,name:'Bexia de Nylon Cao',cat:'Brinquedos',price:12.90,stock:80,minStock:12,unit:'un',emoji:'🎈'},
      {id:31,name:'Casinha Cao Medio',cat:'Casas e Camas',price:189.90,stock:15,minStock:3,unit:'un',emoji:'🏠'},
      {id:32,name:'Casinha Gato com Descanço',cat:'Casas e Camas',price:159.90,stock:12,minStock:3,unit:'un',emoji:'🏠'},
      {id:33,name:'Cama Peluda Oval P',cat:'Casas e Camas',price:89.90,stock:20,minStock:5,unit:'un',emoji:'🛏️'},
      {id:34,name:'Cama Peluda Oval M',cat:'Casas e Camas',price:119.90,stock:15,minStock:4,unit:'un',emoji:'🛏️'},
      {id:35,name:'Cama Peluda Oval G',cat:'Casas e Camas',price:149.90,stock:10,minStock:3,unit:'un',emoji:'🛏️'},
      {id:36,name:'Caixa de Transporte P',cat:'Transporte',price:79.90,stock:20,minStock:5,unit:'un',emoji:'📦'},
      {id:37,name:'Caixa de Transporte M',cat:'Transporte',price:99.90,stock:15,minStock:4,unit:'un',emoji:'📦'},
      {id:38,name:'Caixa de Transporte G',cat:'Transporte',price:129.90,stock:10,minStock:3,unit:'un',emoji:'📦'},
      {id:39,name:'Bolsa de Transporte Gato',cat:'Transporte',price:89.90,stock:18,minStock:4,unit:'un',emoji:'👜'},
      {id:40,name:'Comedouro Inox P',cat:'Acessorios',price:29.90,stock:40,minStock:8,unit:'un',emoji:'🥣'},
      {id:41,name:'Comedouro Inox M',cat:'Acessorios',price:34.90,stock:35,minStock:8,unit:'un',emoji:'🥣'},
      {id:42,name:'Comedouro Inox G',cat:'Acessorios',price:44.90,stock:25,minStock:6,unit:'un',emoji:'🥣'},
      {id:43,name:'Bebedouro Automatico 2L',cat:'Acessorios',price:79.90,stock:20,minStock:5,unit:'un',emoji:'💧'},
      {id:44,name:'Pote Duplo Viagem',cat:'Acessorios',price:34.90,stock:30,minStock:6,unit:'un',emoji:'🍽️'},
      {id:45,name:'Adestrador Eletronico',cat:'Acessorios',price:69.90,stock:15,minStock:3,unit:'un',emoji:'⚡'},
      {id:46,name:'Antipulga Cao P 4un',cat:'Saude',price:59.90,stock:40,minStock:8,unit:'un',emoji:'💊'},
      {id:47,name:'Antipulga Cao G 4un',cat:'Saude',price:79.90,stock:30,minStock:6,unit:'un',emoji:'💊'},
      {id:48,name:'Antipulga Gato 3un',cat:'Saude',price:54.90,stock:35,minStock:8,unit:'un',emoji:'💊'},
      {id:49,name:'Vermifugo Cao 2un',cat:'Saude',price:39.90,stock:50,minStock:10,unit:'un',emoji:'💊'},
      {id:50,name:'Vermifugo Gato 2un',cat:'Saude',price:34.90,stock:45,minStock:10,unit:'un',emoji:'💊'},
      {id:51,name:'Vacina V10 Cao',cat:'Saude',price:89.90,stock:20,minStock:5,unit:'un',emoji:'💉'},
      {id:52,name:'Vacina V4 Gato',cat:'Saude',price:79.90,stock:20,minStock:5,unit:'un',emoji:'💉'},
      {id:53,name:'Vitamina Pet 250ml',cat:'Saude',price:44.90,stock:30,minStock:6,unit:'ml',emoji:'🧪'},
      {id:54,name:'Shampoo Seco Cao 200ml',cat:'Higiene',price:36.90,stock:25,minStock:5,unit:'ml',emoji:'🧴'},
      {id:55,name:'Pasta de Dentes Pet 100g',cat:'Higiene',price:29.90,stock:30,minStock:6,unit:'g',emoji:'🪥'},
      {id:56,name:'Escova de Dentes Pet',cat:'Higiene',price:14.90,stock:50,minStock:10,unit:'un',emoji:'🪥'},
      {id:57,name:'Alicate de Unha Pet',cat:'Higiene',price:24.90,stock:35,minStock:8,unit:'un',emoji:'✂️'},
      {id:58,name:'Pente Antipulga',cat:'Higiene',price:18.90,stock:40,minStock:8,unit:'un',emoji:'🪮'},
      {id:59,name:'Fita Antiparasitaria Cao',cat:'Saude',price:34.90,stock:40,minStock:8,unit:'un',emoji:'🔖'},
      {id:60,name:'Fita Antiparasitaria Gato',cat:'Saude',price:32.90,stock:35,minStock:8,unit:'un',emoji:'🔖'},
      {id:61,name:'Roupa Pet Estampada P',cat:'Roupas',price:39.90,stock:20,minStock:5,unit:'un',emoji:'👗'},
      {id:62,name:'Roupa Pet Estampada M',cat:'Roupas',price:49.90,stock:20,minStock:5,unit:'un',emoji:'👗'},
      {id:63,name:'Roupa Pet Estampada G',cat:'Roupas',price:59.90,stock:15,minStock:4,unit:'un',emoji:'👗'},
      {id:64,name:'Coleira Guia Combo',cat:'Acessorios',price:69.90,stock:25,minStock:5,unit:'un',emoji:'✨'},
      {id:65,name:'Caminha Paninha Quente',cat:'Casas e Camas',price:59.90,stock:20,minStock:5,unit:'un',emoji:'🛏️'},
      {id:66,name:'Capa de Chuva Pet P',cat:'Acessorios',price:34.90,stock:15,minStock:3,unit:'un',emoji:'☔'},
      {id:67,name:'Capa de Chuva Pet M',cat:'Acessorios',price:39.90,stock:15,minStock:3,unit:'un',emoji:'☔'},
      {id:68,name:'Petisco Premium Filhote',cat:'Alimentacao',price:16.90,stock:50,minStock:8,unit:'g',emoji:'🐾'},
      {id:69,name:'Snack Cao Bacon 100g',cat:'Alimentacao',price:14.90,stock:60,minStock:10,unit:'g',emoji:'🥓'},
      {id:70,name:'Ossinho de Couro Natural',cat:'Alimentacao',price:22.90,stock:45,minStock:8,unit:'un',emoji:'🦴'},
      {id:71,name:'Brinquedo Quebra Cabeca',cat:'Brinquedos',price:44.90,stock:20,minStock:5,unit:'un',emoji:'🧩'},
      {id:72,name:'Tunel Gato Dobradiça',cat:'Brinquedos',price:79.90,stock:12,minStock:3,unit:'un',emoji:'🚇'},
      {id:73,name:'Escada Gato Parede',cat:'Casas e Camas',price:129.90,stock:8,minStock:2,unit:'un',emoji:'🪜'},
      {id:74,name:'Cercado Gato Telado',cat:'Casas e Camas',price:149.90,stock:6,minStock:2,unit:'un',emoji:'🏗️'},
      {id:75,name:'GPS Pet Tracker',cat:'Saude',price:149.90,stock:10,minStock:3,unit:'un',emoji:'📍'},
      {id:76,name:'Cama Gel Refrescante P',cat:'Casas e Camas',price:99.90,stock:12,minStock:3,unit:'un',emoji:'❄️'},
      {id:77,name:'Cama Gel Refrescante M',cat:'Casas e Camas',price:129.90,stock:10,minStock:3,unit:'un',emoji:'❄️'},
      {id:78,name:'Cama Gel Refrescante G',cat:'Casas e Camas',price:159.90,stock:8,minStock:2,unit:'un',emoji:'❄️'},
      {id:79,name:'Corta Unha Profissional',cat:'Higiene',price:32.90,stock:25,minStock:5,unit:'un',emoji:'✂️'},
      {id:80,name:'Placa Identificacao Pet',cat:'Acessorios',price:24.90,stock:40,minStock:8,unit:'un',emoji:'🪪'},
      {id:81,name:'Cobertor Pelucia Pequeno',cat:'Casas e Camas',price:49.90,stock:20,minStock:5,unit:'un',emoji:'🧣'},
      {id:82,name:'Cobertor Pelucia Medio',cat:'Casas e Camas',price:69.90,stock:15,minStock:4,unit:'un',emoji:'🧣'},
      {id:83,name:'Mochila Pet Viagem',cat:'Transporte',price:149.90,stock:10,minStock:3,unit:'un',emoji:'🎒'},
      {id:84,name:'Asinha de Passeio Gato',cat:'Acessorios',price:54.90,stock:15,minStock:4,unit:'un',emoji:'🪽'},
      {id:85,name:'Spray Calmante Pet 200ml',cat:'Saude',price:49.90,stock:25,minStock:5,unit:'ml',emoji:'🌿'},
      {id:86,name:'Oleo de Salmão 250ml',cat:'Saude',price:54.90,stock:20,minStock:5,unit:'ml',emoji:'🐟'},
      {id:87,name:'Probiotico Pet 30 caps',cat:'Saude',price:69.90,stock:18,minStock:4,unit:'un',emoji:'💊'},
      {id:88,name:'Pasta Osso Dentiro 100g',cat:'Saude',price:27.90,stock:30,minStock:6,unit:'g',emoji:'🦴'},
      {id:89,name:'Tapete Higienico P',cat:'Higiene',price:39.90,stock:30,minStock:6,unit:'un',emoji:'🧱'},
      {id:90,name:'Tapete Higienico G',cat:'Higiene',price:59.90,stock:20,minStock:5,unit:'un',emoji:'🧱'},
      {id:91,name:'Fraldas Pet G',cat:'Higiene',price:44.90,stock:25,minStock:5,unit:'un',emoji:'👶'},
      {id:92,name:'Cama Ortopedica Cao Grande',cat:'Casas e Camas',price:249.90,stock:8,minStock:2,unit:'un',emoji:'🛏️'},
      {id:93,name:'Bebedouro Filtrante 3L',cat:'Acessorios',price:89.90,stock:15,minStock:4,unit:'un',emoji:'💧'},
      {id:94,name:'Alimentador Automatico 5kg',cat:'Acessorios',price:179.90,stock:10,minStock:3,unit:'un',emoji:'🍽️'},
      {id:95,name:'Canivete Emergencia Pet',cat:'Saude',price:29.90,stock:20,minStock:5,unit:'un',emoji:'🔧'}
    ],
    employees:[
      {id:1,name:'Carlos Silva',role:'Caixa',shift:'Manha',salary:2200,active:true,phone:'(11)99999-1111'},
      {id:2,name:'Maria Santos',role:'Estoque',shift:'Tarde',salary:2400,active:true,phone:'(11)99999-2222'},
      {id:3,name:'Joao Oliveira',role:'Gerente',shift:'Manha',salary:4500,active:true,phone:'(11)99999-3333'},
      {id:4,name:'Ana Costa',role:'Caixa',shift:'Noite',salary:2200,active:true,phone:'(11)99999-4444'},
      {id:5,name:'Pedro Souza',role:'Repositor',shift:'Manha',salary:2000,active:false,phone:'(11)99999-5555'}
    ],
    users:[
      {id:1,username:'admin',password:'admin123',name:'Administrador Geral',type:'admin',active:true},
      {id:2,username:'func',password:'func123',name:'Funcionario Teste',type:'func',active:true},
      {id:3,username:'cliente',password:'cli123',name:'Cliente Teste',type:'cliente',active:true}
    ],
    clients:[
      {id:1,name:'Joao Pereira',phone:'(11)98888-1001',cpf:'123.456.789-00',email:'joao@email.com',address:'Rua das Flores, 100 - SP',active:true,dogs:[]},
      {id:2,name:'Ana Beatriz',phone:'(11)98888-1002',cpf:'987.654.321-00',email:'ana@email.com',address:'Av. Brasil, 200 - SP',active:true,dogs:[{name:'Rex',breed:'Labrador',age:3,color:'Dourado'},{name:'Luna',breed:'Poodle',age:2,color:'Branco'}]},
      {id:3,name:'Carlos Mendes',phone:'(11)98888-1003',cpf:'456.789.123-00',email:'carlos@email.com',address:'Rua Augusta, 300 - SP',active:true,dogs:[{name:'Thor',breed:'Bulldog',age:4,color:'Marrom'}]}
    ],
    bathGrooming:[
      {id:1,clientId:2,dogName:'Rex',service:'Banho e Tosa Completa',date:new Date(Date.now()-86400000*2).toISOString(),price:120,status:'Concluido',notes:'Cachorro calmo',professional:'Maria Santos'},
      {id:2,clientId:2,dogName:'Luna',service:'Banho Simples',date:new Date(Date.now()-86400000).toISOString(),price:60,status:'Concluido',notes:'Usar shampoo hipoalergenico',professional:'Ana Costa'},
      {id:3,clientId:3,dogName:'Thor',service:'Banho e Tosa Completa',date:new Date(Date.now()+86400000).toISOString(),price:130,status:'Agendado',notes:'Cuidado com rolinho do focinho',professional:'Maria Santos'}
    ],
    services:[
      {id:1,name:'Banho Simples',price:60,duration:60,description:'Banho com shampoo neutro, secagem e penteado basico',active:true},
      {id:2,name:'Banho e Tosa Completa',price:120,duration:120,description:'Banho, tosa higienica, corte de unhas e limpeza de ouvidos',active:true},
      {id:3,name:'Tosa Higienica',price:70,duration:60,description:'Tosa na regiao genital, patas e visao',active:true},
      {id:4,name:'Tosa Completa',price:90,duration:90,description:'Tosa em todo o corpo conforme padrao da raca',active:true},
      {id:5,name:'Corte de Unhas',price:25,duration:20,description:'Corte e lixamento de unhas',active:true},
      {id:6,name:'Limpeza de Ouvidos',price:20,duration:15,description:'Limpeza e higienizacao dos ouvidos',active:true},
      {id:7,name:'Lavagem Profunda',price:80,duration:75,description:'Lavagem com produtos especiais para pele sensivel',active:true},
      {id:8,name:'Pacote VIP (Banho+Tosa+Unhas+Ouvidos)',price:160,duration:150,description:'Servico completo: banho, tosa, unhas e ouvidos',active:true}
    ],
    clientPackages:[],
    waitingList:[],
    sales:[],
    activityLog:[],
    nextProductId:96,
    nextEmployeeId:6,
    nextUserId:4,
    nextSaleId:1,
    nextClientId:4,
    nextBathId:4,
    nextServiceId:9,
    nextPackageId:1,
    settings:{
      pixKey:'',
      pixName:'PetShop Prado',
      pixCity:'Sao Paulo',
      userPermissions:{
        admin:{
          dashboard:true,pdv:true,calculator:true,products:true,stock:true,expiryreport:true,
          employees:true,users:true,categories:true,pricetags:true,clients:true,bathgrooming:true,services:true,packages:true,
          sales:true,expenses:true,reports:true,company:true,activitylog:true,dbconfig:true,
          backup:true,settings:true,permissions:true,bulkpriceincrease:true
        },
        func:{
          dashboard:true,pdv:true,calculator:true,products:true,stock:true,expiryreport:true,
          employees:false,users:false,categories:true,pricetags:true,clients:true,bathgrooming:true,services:true,packages:true,
          sales:true,expenses:false,reports:false,company:false,activitylog:false,dbconfig:false,
          backup:false,settings:false,permissions:false,bulkpriceincrease:false
        },
        cliente:{
          dashboard:false,pdv:true,calculator:true,products:false,stock:false,expiryreport:false,
          employees:false,users:false,categories:false,pricetags:false,clients:false,bathgrooming:false,services:false,packages:false,
          sales:false,expenses:false,reports:false,company:false,activitylog:false,dbconfig:false,
          backup:false,settings:false,permissions:false,bulkpriceincrease:false
        }
      }
    }
  };

  // Load from server or localStorage
  var DB_VERSION=8;
  var saved=localStorage.getItem('petshoppradoDB');
  var savedVer=parseInt(localStorage.getItem('petshoppradoDBVer'))||0;
  if(saved&&savedVer>=DB_VERSION){try{DB=JSON.parse(saved)}catch(e){}}
  // Try loading from shared server (sync via XMLHttpRequest to avoid login race)
  (function(){
    try{
      var xhr=new XMLHttpRequest();
      xhr.open('GET','/api/load',false);
      xhr.send();
      if(xhr.status===200){
        var d=JSON.parse(xhr.responseText);
        if(d&&d.products){
          DB=d;
          localStorage.setItem('petshoppradoDB',JSON.stringify(DB));
          localStorage.setItem('petshoppradoDBVer',DB_VERSION);
        }
      }
    }catch(e){}
  })();

  // Garantir que campos obrigatorios existam
  if(!DB.clientPackages)DB.clientPackages=[];
  if(!DB.waitingList)DB.waitingList=[];
  if(!DB.expenses)DB.expenses=[];
  if(!DB.activityLog)DB.activityLog=[];
  if(!DB.sales)DB.sales=[];

  // SSE - Sincronizacao em tempo real
  var sseConnection=null;
  var isSaving=false;
  function connectSSE(){
    if(sseConnection){sseConnection.close()}
    try{
      sseConnection=new EventSource('/api/events');
      sseConnection.addEventListener('connected',function(e){
        console.log('[SSE] Conectado ao servidor');
      });
      sseConnection.addEventListener('update',function(e){
        if(isSaving)return;
        try{
          var data=JSON.parse(e.data);
          console.log('[SSE] Atualizacao recebida (v'+data.version+')');
          var xhr=new XMLHttpRequest();
          xhr.open('GET','/api/load',false);
          xhr.send();
          if(xhr.status===200){
            var d=JSON.parse(xhr.responseText);
            if(d&&d.products){
              DB=d;
              localStorage.setItem('petshoppradoDB',JSON.stringify(DB));
              localStorage.setItem('petshoppradoDBVer',DB_VERSION);
              renderPage();
              toast('Dados atualizados por outro dispositivo!','info');
            }
          }
        }catch(ex){}
      });
      sseConnection.onerror=function(){
        console.warn('[SSE] Erro na conexao, reconectando em 3s...');
        sseConnection.close();
        setTimeout(connectSSE,3000);
      };
    }catch(e){
      console.warn('[SSE] Nao foi possivel conectar:',e);
      setTimeout(connectSSE,5000);
    }
  }
  connectSSE();

  function saveDB(){
    var payload=JSON.stringify(DB);
    localStorage.setItem('petshoppradoDB',payload);
    localStorage.setItem('petshoppradoDBVer',DB_VERSION);
    isSaving=true;
    fetch('/api/save',{method:'POST',headers:{'Content-Type':'application/json'},body:payload})
      .then(function(){isSaving=false})
      .catch(function(){isSaving=false});
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
  }
  function closeModal(){$('modalBg').classList.remove('open');$('modalBox').className='modal'}
  $('modalX').addEventListener('click',closeModal);
  $('modalBg').addEventListener('click',function(e){if(e.target===$('modalBg'))closeModal()});

  // ===== LOGIN =====
  function enterApp(user,page){
    currentUser=user;
    $('loginPage').style.display='none';
    $('appPage').style.display='block';
    $('userName').textContent=user.name;
    $('userRole').textContent=user.type==='admin'?'Administrador':user.type==='func'?'Funcionario':'Cliente';
    $('userAvatar').textContent=user.name[0].toUpperCase();
    buildSidebar();
    navigateTo(page||'pdv');
    logActivity('LOGIN','Usuario logado no sistema');
    toast('Bem-vindo, '+user.name+'!','success');
  }

  $('loginBtn').addEventListener('click',function(){
    var u=$('loginUser').value.trim();
    var p=$('loginPass').value.trim();
    if(!u||!p){toast('Preencha usuario e senha!','error');return}
    var found=DB.users.find(function(x){return x.username===u&&x.password===p&&x.active});
    if(found){
      localStorage.setItem('petshoppradoSession',JSON.stringify({userId:found.id,type:found.type,page:'dashboard'}));
      enterApp(found);
    }else{
      toast('Usuario ou senha invalidos!','error');
    }
  });
  $('loginPass').addEventListener('keydown',function(e){if(e.key==='Enter')$('loginBtn').click()});
  $('loginUser').addEventListener('keydown',function(e){if(e.key==='Enter')$('loginPass').focus()});
  setTimeout(function(){var u=$('loginUser');if(u)u.focus()},300);

  // ===== AUTO-LOGIN =====
  (function(){
    var session=localStorage.getItem('petshoppradoSession');
    if(session){
      try{
        var s=JSON.parse(session);
        var user=DB.users.find(function(x){return x.id===s.userId&&x.type===s.type&&x.active});
        if(user)enterApp(user,s.page);
      }catch(e){}
    }
  })();

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
          {id:'dashboard',icon:'📊',label:'Dashboard'},
          {id:'pdv',icon:'🛒',label:'PDV / Caixa'},
          {id:'calculator',icon:'🧮',label:'Calculadora'}
        ]},
        {group:'Gestao',items:[
          {id:'products',icon:'📦',label:'Produtos'},
          {id:'stock',icon:'📋',label:'Estoque'},
          {id:'expiryreport',icon:'📅',label:'Validade'},
          {id:'employees',icon:'👥',label:'Funcionarios'},
          {id:'users',icon:'👤',label:'Usuarios'},
          {id:'categories',icon:'🏷️',label:'Categorias'},
          {id:'pricetags',icon:'🏷️',label:'Etiquetas'}
        ]},
        {group:'PetShop',items:[
          {id:'clients',icon:'🧑',label:'Clientes'},
          {id:'bathgrooming',icon:'🛁',label:'Banho & Tosa'},
          {id:'services',icon:'🛎️',label:'Servicos'},
          {id:'packages',icon:'🎫',label:'Pacotes'}
        ]},
        {group:'Financeiro',items:[
          {id:'sales',icon:'💰',label:'Vendas'},
          {id:'expenses',icon:'💸',label:'Despesas'},
          {id:'reports',icon:'📈',label:'Relatorios'}
        ]},
        {group:'Sistema',items:[
          {id:'company',icon:'🏢',label:'Empresa'},
          {id:'activitylog',icon:'📝',label:'Log de Atividades'},
          {id:'dbconfig',icon:'🗄️',label:'Banco de Dados'},
          {id:'backup',icon:'🔄',label:'Backup / Restore'},
          {id:'settings',icon:'⚙️',label:'Configuracoes'},
          {id:'permissions',icon:'🔐',label:'Permissoes'}
        ]}
      ];
    }else if(currentUser.type==='func'){
      items=[
        {group:'Principal',items:[
          {id:'dashboard',icon:'📊',label:'Dashboard'},
          {id:'pdv',icon:'🛒',label:'PDV / Caixa'},
          {id:'calculator',icon:'🧮',label:'Calculadora'}
        ]},
        {group:'Gestao',items:[
          {id:'products',icon:'📦',label:'Produtos'},
          {id:'stock',icon:'📋',label:'Estoque'},
          {id:'expiryreport',icon:'📅',label:'Validade'},
          {id:'employees',icon:'👥',label:'Funcionarios'},
          {id:'users',icon:'👤',label:'Usuarios'},
          {id:'categories',icon:'🏷️',label:'Categorias'},
          {id:'pricetags',icon:'🏷️',label:'Etiquetas'}
        ]},
        {group:'PetShop',items:[
          {id:'clients',icon:'🧑',label:'Clientes'},
          {id:'bathgrooming',icon:'🛁',label:'Banho & Tosa'},
          {id:'services',icon:'🛎️',label:'Servicos'},
          {id:'packages',icon:'🎫',label:'Pacotes'}
        ]},
        {group:'Financeiro',items:[
          {id:'sales',icon:'💰',label:'Vendas'},
          {id:'expenses',icon:'💸',label:'Despesas'},
          {id:'reports',icon:'📈',label:'Relatorios'}
        ]},
        {group:'Sistema',items:[
          {id:'company',icon:'🏢',label:'Empresa'},
          {id:'activitylog',icon:'📝',label:'Log de Atividades'},
          {id:'dbconfig',icon:'🗄️',label:'Banco de Dados'},
          {id:'backup',icon:'🔄',label:'Backup / Restore'},
          {id:'settings',icon:'⚙️',label:'Configuracoes'}
        ]}
      ];
    }else{
      items=[
        {group:'Principal',items:[
          {id:'pdv',icon:'🛒',label:'Comprar'},
          {id:'calculator',icon:'🧮',label:'Calculadora'}
        ]},
        {group:'Conta',items:[
          {id:'myorders',icon:'📦',label:'Meus Pedidos'}
        ]},
        {group:'PetShop',items:[
          {id:'bathgrooming',icon:'🛁',label:'Meus Agendamentos'}
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
        html+='<button data-page="'+it.id+'"'+(it.id===currentPage?' class="active"':'')+'><span class="icon">'+it.icon+'</span>'+it.label+'</button>';
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
      case 'settings':renderSettings(m);break;
      case 'permissions':renderPermissions(m);break;
      default:m.innerHTML='<div class="empty-msg">Pagina nao encontrada</div>';
    }
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
    var totalProfit=totalRevenue-totalExpenses;
    var totalEmp=DB.employees.filter(function(e){return e.active}).length;
    var totalUsers=DB.users.filter(function(u){return u.active}).length;

    var today=new Date().toDateString();
    var todaySales=activeSales.filter(function(s){return new Date(s.date).toDateString()===today});
    var todayRevenue=todaySales.reduce(function(s,v){return s+v.total},0);
    var todayExpenses=(DB.expenses||[]).filter(function(e){return new Date(e.date).toDateString()===today});
    var todayExpTotal=todayExpenses.reduce(function(s,e){return s+e.amount},0);
    var expiredCount=DB.products.filter(function(p){var s=getExpiryStatus(p);return s&&s.status==='expired'}).length;
    var criticalCount=DB.products.filter(function(p){var s=getExpiryStatus(p);return s&&s.status==='critical'}).length;

    m.innerHTML=
      '<div class="page-header"><h2>📊 Dashboard</h2><div class="header-actions">'+
      '<button class="btn btn-ghost" onclick="navigateTo(\'pdv\')">🛒 Abrir PDV</button>'+
      '</div></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card"><div class="sc-icon">💰</div><div class="sc-value">'+formatMoney(totalRevenue)+'</div><div class="sc-label">Receita Total</div></div>'+
      '<div class="stat-card"><div class="sc-icon">💸</div><div class="sc-value" style="color:var(--danger)">'+formatMoney(totalExpenses)+'</div><div class="sc-label">Despesas Total</div></div>'+
      '<div class="stat-card"><div class="sc-icon">📈</div><div class="sc-value" style="color:'+(totalProfit>=0?'var(--success)':'var(--danger)')+'">'+formatMoney(totalProfit)+'</div><div class="sc-label">Lucro Liquido</div></div>'+
      '<div class="stat-card"><div class="sc-icon">📅</div><div class="sc-value">'+formatMoney(todayRevenue)+'</div><div class="sc-label">Vendas Hoje</div><div class="sc-change sc-up">'+todaySales.length+' vendas</div></div>'+
      '<div class="stat-card"><div class="sc-icon">📦</div><div class="sc-value">'+totalProducts+'</div><div class="sc-label">Produtos Cadastrados</div></div>'+
      '<div class="stat-card"><div class="sc-icon">⚠️</div><div class="sc-value" style="color:var(--danger)">'+lowStock+'</div><div class="sc-label">Estoque Baixo</div>'+(lowStock>0?'<div class="sc-change sc-down">Reponha urgentemente!</div>':'<div class="sc-change sc-up">Estoque OK</div>')+'</div>'+
      '<div class="stat-card"><div class="sc-icon">🛒</div><div class="sc-value">'+totalSales+'</div><div class="sc-label">Total de Vendas</div></div>'+
      '<div class="stat-card"><div class="sc-icon">🏷️</div><div class="sc-value">'+formatMoney(totalStockValue)+'</div><div class="sc-label">Valor em Estoque</div></div>'+
      (expiredCount>0||criticalCount>0?'<div class="stat-card" style="cursor:pointer" onclick="navigateTo(\'expiryreport\')"><div class="sc-icon">📅</div><div class="sc-value" style="color:'+(expiredCount>0?'#ff4757':'#f39c12')+'">'+expiredCount+'</div><div class="sc-label">Produtos Vencidos</div>'+(criticalCount>0?'<div class="sc-change sc-down">'+criticalCount+' vencem em 30 dias</div>':'<div class="sc-change sc-up">Ver relatorio</div>')+'</div>':'')+
      '</div>'+

      '<div style="display:grid;grid-template-columns:2fr 1fr;gap:20px;margin-bottom:24px">'+
      '<div class="settings-card" style="margin:0">'+
      '<h3>📊 Receitas vs Despesas — Ultimos 6 Meses</h3>'+
      renderFinanceChart()+
      '</div>'+
      '<div class="settings-card" style="margin:0">'+
      '<h3>📅 Resumo de Hoje</h3>'+
      '<div style="padding:12px 0">'+
      '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="color:var(--txt2)">Receitas</span><span style="font-weight:700;color:var(--success)">'+formatMoney(todayRevenue)+'</span></div>'+
      '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)"><span style="color:var(--txt2)">Despesas</span><span style="font-weight:700;color:var(--danger)">'+formatMoney(todayExpTotal)+'</span></div>'+
      '<div style="display:flex;justify-content:space-between;padding:8px 0;font-weight:700"><span>Lucro</span><span style="color:'+(todayRevenue-todayExpTotal>=0?'var(--success)':'var(--danger)')+'">'+formatMoney(todayRevenue-todayExpTotal)+'</span></div>'+
      '</div></div></div>'+

      '<h3 style="margin-bottom:16px;font-size:18px">⚠️ Produtos com Estoque Baixo</h3>'+
      renderLowStockTable();
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

  function isWeightProduct(p){if(!p)return false;if(p.weighable===true)return true;if(p.weighable===false)return false;return p.unit==='kg'||p.unit==='g'||p.unit==='ml'}
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

  async function scaleConnect(){
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

  async function scaleDisconnect(){
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

  function scaleConnectUSB(){
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

  function scaleDisconnectUSB(){
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
          connBtns.innerHTML='<button class="scale-btn-connect connect" onclick="scaleConnectUSB()" title="Ativar balanca USB (emulacao teclado)">🔌 Conectar USB</button>';
        }else{
          connBtns.innerHTML='<button class="scale-btn-connect connect" onclick="scaleConnect()" title="Conectar balanca serial RS-232">📡 Conectar Serial</button>';
        }
      }
    }
  }

  function buildScalePanelHTML(){
    var cfg=getScaleCfg();
    var modeLabel=cfg.mode==='usb'?'USB (Teclado)':'Serial (RS-232)';
    var connLabel=cfg.mode==='usb'?'🔌 Conectar USB':'📡 Conectar Serial';
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

  // ===== PDV =====
  function renderPDV(m){
    var cats=[...new Set(DB.products.map(function(p){return p.cat}))];
    m.innerHTML=
      '<div class="page-header"><h2>🛒 PDV — Ponto de Venda</h2></div>'+
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
      '<div class="pdv-cart-head"><h3>🛒 Carrinho</h3><button class="btn btn-ghost" style="padding:6px 12px;font-size:12px" onclick="clearCart()">Limpar</button></div>'+
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
      '<input type="text" class="barcode-input" id="barcodeInput" placeholder="Escaneie ou digite o codigo..." autocomplete="off" maxlength="13">'+
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
      return '<div class="pdv-item" onclick="addToCart('+p.id+')"'+(hasPromo?' style="border-color:rgba(46,213,115,.4)"'+(borderStyle?';'+borderStyle:''):''+(!hasPromo&&borderStyle?' style="'+borderStyle+'"':''))+'>'+
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
      status.innerHTML='<span class="bc-notfound">✕ Codigo nao encontrado: '+code+'</span>';
      input.value='';input.focus();
      toast('Codigo de barras nao encontrado!','error');
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
    var total=cartItems.reduce(function(s,c){
      var p=DB.products.find(function(x){return x.id===c.id});
      var unitPrice=(p&&p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price)?p.promoPrice:p.price;
      return s+(p?unitPrice*c.qty:0);
    },0);
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
      clientId:null,
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
        '<span>'+p.name+' '+c.qty+(isWeightProduct(p)?' '+(p.unit||'kg'):'x1')+'</span>'+
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
      '<div style="font-size:13px;font-weight:700;color:var(--txt2);margin-bottom:8px">📝 Dividir Pagamento (preencha os campos desejados):</div>'+
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
      clientId:null,
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
    openModal('Cupom Fiscal #'+sale.id,html,'<button class="btn btn-ghost" onclick="printReceipt()">🖨 Imprimir</button><button class="btn btn-primary" onclick="closeModal()">Fechar</button>','modal-receipt');
  }

  window.printReceipt=function(){
    var content=$('receiptContent');
    if(!content)return;
    var win=window.open('','','width=320,height=600');
    win.document.write('<html><head><title>Cupom</title><style>'+
      'body{margin:0;padding:8px;font-family:Courier New,monospace;font-size:11px;line-height:1.5;color:#000;background:#fff}'+
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
      content.innerHTML+
      '</body></html>');
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

  // ===== PRODUCTS =====
  function renderProducts(m){
    m.innerHTML=
      '<div class="page-header"><h2>📦 Produtos</h2><div class="header-actions">'+
      ((DB.settings.userPermissions&&DB.settings.userPermissions[currentUser.type]&&DB.settings.userPermissions[currentUser.type].bulkpriceincrease!==false)?'<button class="btn btn-ghost" onclick="openBulkPriceIncrease()">📈 Aumentar Preco (%)</button>':'')+
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
      return '<tr style="'+rowStyle+'"><td style="font-size:24px">'+p.emoji+'</td><td><strong>'+p.name+'</strong>'+(isWeightProduct(p)?' <span class="badge-sm b-blue" style="font-size:9px">⚖ PESO</span>':'')+'</td><td><span class="badge-sm b-blue">'+p.cat+'</span></td><td style="font-weight:700;color:var(--accent)">'+formatMoney(p.price)+'</td><td>'+(p.cost?'<span style="font-size:11px;color:var(--txt2)">Custo: '+formatMoney(p.cost)+(p.markup?' ('+p.markup+'%)':'')+'</span><br>':'')+p.stock+' '+p.unit+' <span class="badge-sm '+stockClass+'" style="margin-left:4px">'+stockLabel+'</span></td><td>'+(p.expiryDate?'<span style="font-size:11px">'+formatExpiryDate(p.expiryDate)+'</span><br>':'')+(p.lot?'<span style="font-size:10px;color:var(--txt2)">Lote: '+p.lot+'</span><br>':'')+expHtml+'</td><td><div class="action-btns"><button onclick="openProductModal('+p.id+')" title="Editar">✎</button><button class="danger" onclick="deleteProduct('+p.id+')" title="Excluir">🗑</button></div></td></tr>';
    }).join('');
    $('prodTableBody').innerHTML=html||'<tr><td colspan="7" class="empty-msg">Nenhum produto encontrado</td></tr>';
  }
  window.openProductModal=function(id){
    var p=id?DB.products.find(function(x){return x.id===id}):null;
    var cats=['Alimentacao','Higiene','Acessorios','Brinquedos','Casas e Camas','Transporte','Saude','Roupas','Outros'];
    var emojis=['🐕','🐱','🐶','🐈','🦴','🐟','🍗','🥩','🧴','💊','💉','🏠','🛏️','🔗','📿','🪮','✂️','🐾','✨'];
    var cost=p?(p.cost||''):'';
    var markup=p?(p.markup||''):'';
    var body=
      '<label>Emoji</label><select id="pEmoji">'+emojis.map(function(e){return '<option'+(p&&p.emoji===e?' selected':'')+'>'+e+'</option>'}).join('')+'</select>'+
      '<label>Nome</label><input type="text" id="pName" value="'+(p?p.name:'')+'">'+
      '<label>Categoria</label><select id="pCat">'+cats.map(function(c){return '<option'+(p&&p.cat===c?' selected':'')+'>'+c+'</option>'}).join('')+'</select>'+

      '<div style="background:var(--bg3);border-radius:var(--r);padding:14px;margin:8px 0;border:1px solid var(--border)">'+
      '<div style="font-size:12px;font-weight:700;color:var(--accent);margin-bottom:10px">💰 Precificacao</div>'+
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
      '<div style="font-size:12px;font-weight:700;color:var(--accent);margin-bottom:10px">📅 Validade e Lote</div>'+
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
    if(!confirm('Excluir este produto?'))return;
    var p=DB.products.find(function(x){return x.id===id});
    DB.products=DB.products.filter(function(p){return p.id!==id});
    logActivity('PRODUTO_EXCLUIDO','Produto: '+(p?p.name:'ID '+id));
    saveDB();renderProductTable();toast('Produto excluido!','success');
  };

  window.openBulkPriceIncrease=function(){
    var body=
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r);margin-bottom:16px;border:1px solid var(--border)">'+
      '<div style="font-size:12px;font-weight:700;color:var(--accent);margin-bottom:8px">📦 Produtos atuais: <strong>'+DB.products.length+'</strong></div>'+
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
      '<div style="font-size:12px;font-weight:700;color:var(--accent);margin-bottom:8px">📈 Preview do Aumento</div>'+
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
      '<div class="page-header"><h2>📋 Controle de Estoque</h2></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card"><div class="sc-icon">📦</div><div class="sc-value">'+totalItems+'</div><div class="sc-label">Itens em Estoque</div></div>'+
      '<div class="stat-card"><div class="sc-icon">💰</div><div class="sc-value">'+formatMoney(totalValue)+'</div><div class="sc-label">Valor Total</div></div>'+
      '<div class="stat-card"><div class="sc-icon">⚠️</div><div class="sc-value" style="color:var(--danger)">'+DB.products.filter(function(p){return p.stock<=p.minStock}).length+'</div><div class="sc-label">Abaixo do Minimo</div></div>'+
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
      return '<tr><td style="font-size:20px">'+p.emoji+'</td><td><strong>'+p.name+'</strong></td><td>'+p.cat+'</td><td style="font-weight:700">'+p.stock+' '+p.unit+'</td><td>'+p.minStock+' '+p.unit+'</td><td><span class="badge-sm '+status+'">'+label+'</span></td><td><div class="action-btns"><button onclick="restockProduct('+p.id+')" title="Repor Estoque">📦</button><button onclick="adjustStock('+p.id+')" title="Ajustar">✎</button></div></td></tr>';
    }).join('');
  }
  window.restockProduct=function(id){
    var p=DB.products.find(function(x){return x.id===id});
    if(!p)return;
    var body='<label>Produto</label><input type="text" value="'+p.name+'" disabled>'+
      '<label>Estoque Atual</label><input type="text" value="'+p.stock+' '+p.unit+'" disabled>'+
      '<label>Quantidade para Repor</label><input type="number" id="restockQty" value="0" min="1">';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="doRestock('+id+')">Repor</button>';
    openModal('Repor Estoque',body,foot);
  };
  window.doRestock=function(id){
    var qty=parseInt($('restockQty').value)||0;
    if(qty<=0){toast('Quantidade invalida!','error');return}
    var p=DB.products.find(function(x){return x.id===id});
    p.stock+=qty;
    logActivity('ESTOQUE_REPOSTO',p.name+' — +'+qty+' '+p.unit+' (total: '+p.stock+')');
    saveDB();closeModal();renderStockTable();toast('Estoque reposto! +'+qty+' '+p.unit,'success');
  };
  window.adjustStock=function(id){
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
      '<div class="page-header"><h2>👥 Funcionarios</h2><div class="header-actions">'+
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
      return '<tr><td><strong>'+e.name+'</strong></td><td><span class="badge-sm b-purple">'+e.role+'</span></td><td>'+e.shift+'</td><td style="font-weight:700;color:var(--accent)">'+formatMoney(e.salary)+'</td><td style="color:var(--txt2)">'+e.phone+'</td><td>'+(e.active?'<span class="badge-sm b-green">Ativo</span>':'<span class="badge-sm b-red">Inativo</span>')+'</td><td><div class="action-btns"><button onclick="openEmployeeModal('+e.id+')" title="Editar">✎</button><button class="danger" onclick="toggleEmployee('+e.id+')" title="'+(e.active?'Desativar':'Ativar')+'">'+(e.active?'⏻':'✓')+'</button></div></td></tr>';
    }).join('');
  }
  window.openEmployeeModal=function(id){
    var e=id?DB.employees.find(function(x){return x.id===id}):null;
    var body=
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
    m.innerHTML=
      '<div class="page-header"><h2>👤 Usuarios</h2><div class="header-actions">'+
      '<button class="btn btn-primary" onclick="openUserModal()">+ Novo Usuario</button>'+
      '</div></div>'+
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
      return '<tr><td><strong>'+u.name+'</strong></td><td style="color:var(--txt2)">@'+u.username+'</td><td><span class="badge-sm '+typeClass+'">'+typeLabel+'</span></td><td>'+(u.active?'<span class="badge-sm b-green">Ativo</span>':'<span class="badge-sm b-red">Inativo</span>')+'</td><td><div class="action-btns"><button onclick="openUserModal('+u.id+')" title="Editar">✎</button><button class="danger" onclick="toggleUser('+u.id+')" title="'+(u.active?'Desativar':'Ativar')+'">'+(u.active?'⏻':'✓')+'</button></div></td></tr>';
    }).join('');
  }
  window.openUserModal=function(id){
    var u=id?DB.users.find(function(x){return x.id===id}):null;
    var body=
      '<label>Nome Completo</label><input type="text" id="uName" value="'+(u?u.name:'')+'">'+
      '<label>Nome de Usuario</label><input type="text" id="uUsername" value="'+(u?u.username:'')+'">'+
      '<label>Senha</label><input type="text" id="uPassword" value="'+(u?u.password:'')+'" placeholder="'+(u?'Deixe vazio para manter':'')+'">'+
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
      return '<div class="stat-card"><div class="sc-icon">🏷️</div><div class="sc-value">'+cats[c].count+'</div><div class="sc-label">'+c+'</div><div class="sc-change" style="color:var(--accent)">'+formatMoney(cats[c].value)+'</div></div>';
    }).join('');
    m.innerHTML=
      '<div class="page-header"><h2>🏷️ Categorias</h2></div>'+
      '<div class="stats-row">'+html+'</div>';
  }

  // ===== SALES =====
  function renderSales(m){
    var activeSales=DB.sales.filter(function(s){return s.status!=='cancelado'});
    var totalRevenue=activeSales.reduce(function(s,v){return s+v.total},0);
    m.innerHTML=
      '<div class="page-header"><h2>💰 Vendas</h2></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card"><div class="sc-icon">🛒</div><div class="sc-value">'+activeSales.length+'</div><div class="sc-label">Vendas Ativas</div></div>'+
      '<div class="stat-card"><div class="sc-icon">💰</div><div class="sc-value">'+formatMoney(totalRevenue)+'</div><div class="sc-label">Receita Total</div></div>'+
      '<div class="stat-card"><div class="sc-icon">🚫</div><div class="sc-value" style="color:var(--danger)">'+(DB.sales.length-activeSales.length)+'</div><div class="sc-label">Canceladas</div></div>'+
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
    var footerBtns='<button class="btn btn-ghost" onclick="printReceipt()">🖨 Imprimir</button>';
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
      '<div class="page-header"><h2>📅 Relatorio de Validade</h2></div>'+

      '<div class="stats-row">'+
      '<div class="stat-card" style="border-left:4px solid #ff4757"><div class="sc-icon">🚫</div><div class="sc-value" style="color:#ff4757">'+expired.length+'</div><div class="sc-label">Vencidos</div></div>'+
      '<div class="stat-card" style="border-left:4px solid #ff6348"><div class="sc-icon">🔴</div><div class="sc-value" style="color:#ff6348">'+critical.length+'</div><div class="sc-label">Vencem em 30 dias</div></div>'+
      '<div class="stat-card" style="border-left:4px solid #f39c12"><div class="sc-icon">🟡</div><div class="sc-value" style="color:#f39c12">'+warning.length+'</div><div class="sc-label">Vencem em 90 dias</div></div>'+
      '<div class="stat-card" style="border-left:4px solid #2ed573"><div class="sc-icon">✅</div><div class="sc-value" style="color:#2ed573">'+ok.length+'</div><div class="sc-label">Validos</div></div>'+
      '<div class="stat-card" style="border-left:4px solid var(--txt2)"><div class="sc-icon">⚪</div><div class="sc-value">'+noDate.length+'</div><div class="sc-label">Sem Validade</div></div>'+
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
      '<h3 style="color:#ff6348">🔴 Vencem em Breve — Ate 30 Dias ('+critical.length+')</h3>'+
      '<div class="table-wrap" style="margin:0"><table><thead><tr><th>Produto</th><th>Categoria</th><th>Lote</th><th>Validade</th><th>Dias Restantes</th><th>Estoque</th></tr></thead><tbody>'+
      critical.map(function(p){
        var exp=getExpiryStatus(p);
        return '<tr style="background:rgba(255,99,72,.04)"><td>'+p.emoji+' <strong>'+p.name+'</strong></td><td><span class="badge-sm b-blue">'+p.cat+'</span></td><td>'+(p.lot||'-')+'</td><td style="color:#ff6348;font-weight:700">'+formatExpiryDate(p.expiryDate)+'</td><td><span style="color:#ff6348;font-weight:700">'+exp.days+' dias</span></td><td>'+p.stock+' '+p.unit+'</td></tr>';
      }).join('')+
      '</tbody></table></div></div>':'')+

      (warning.length>0?
      '<div class="settings-card" style="margin-bottom:20px;border:2px solid rgba(243,156,18,.3);background:rgba(243,156,18,.05)">'+
      '<h3 style="color:#f39c12">🟡 Vencem em 30 a 90 Dias ('+warning.length+')</h3>'+
      '<div class="table-wrap" style="margin:0"><table><thead><tr><th>Produto</th><th>Categoria</th><th>Lote</th><th>Validade</th><th>Dias Restantes</th><th>Estoque</th></tr></thead><tbody>'+
      warning.map(function(p){
        var exp=getExpiryStatus(p);
        return '<tr style="background:rgba(243,156,18,.04)"><td>'+p.emoji+' <strong>'+p.name+'</strong></td><td><span class="badge-sm b-blue">'+p.cat+'</span></td><td>'+(p.lot||'-')+'</td><td style="color:#f39c12;font-weight:700">'+formatExpiryDate(p.expiryDate)+'</td><td><span style="color:#f39c12;font-weight:700">'+exp.days+' dias</span></td><td>'+p.stock+' '+p.unit+'</td></tr>';
      }).join('')+
      '</tbody></table></div></div>':'')+

      (ok.length>0?
      '<div class="settings-card" style="margin-bottom:20px;border:2px solid rgba(46,213,115,.3);background:rgba(46,213,115,.05)">'+
      '<h3 style="color:#2ed573">✅ Produtos Validos ('+ok.length+')</h3>'+
      '<div class="table-wrap" style="margin:0"><table><thead><tr><th>Produto</th><th>Categoria</th><th>Lote</th><th>Validade</th><th>Dias Restantes</th><th>Estoque</th></tr></thead><tbody>'+
      ok.map(function(p){
        var exp=getExpiryStatus(p);
        return '<tr><td>'+p.emoji+' <strong>'+p.name+'</strong></td><td><span class="badge-sm b-blue">'+p.cat+'</span></td><td>'+(p.lot||'-')+'</td><td>'+formatExpiryDate(p.expiryDate)+'</td><td><span style="color:#2ed573">'+exp.days+' dias</span></td><td>'+p.stock+' '+p.unit+'</td></tr>';
      }).join('')+
      '</tbody></table></div></div>':'')+

      (all.length===0?'<div class="empty-msg" style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--rl);padding:60px"><div style="font-size:48px;margin-bottom:12px">📅</div>Nenhum produto com validade cadastrada.<br>Cadastre produtos com data de validade para acompanhar.</div>':'');
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
      '<div class="page-header"><h2>💸 Despesas</h2></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card"><div class="sc-icon">📅</div><div class="sc-value" style="color:var(--danger)">'+formatMoney(todayTotal)+'</div><div class="sc-label">Despesas Hoje</div><div class="sc-change">'+todayExpenses.length+' registros</div></div>'+
      '<div class="stat-card"><div class="sc-icon">📆</div><div class="sc-value" style="color:var(--danger)">'+formatMoney(monthTotal)+'</div><div class="sc-label">'+monthNames[curMonth]+' — Total</div><div class="sc-change">'+monthExpenses.length+' registros</div></div>'+
      '</div>'+

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">'+
      '<div class="settings-card" style="margin:0">'+
      '<h3>➕ Nova Despesa</h3>'+
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
      '<button class="btn btn-primary" style="margin-top:12px;width:100%" onclick="addExpense()">💸 Registrar Despesa</button>'+
      '</div>'+

      '<div>'+
      '<div class="settings-card" style="margin:0;margin-bottom:16px">'+
      '<h3>📊 Despesas por Categoria — '+monthNames[curMonth]+'</h3>'+
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
      return '<tr><td>'+formatDate(e.date)+'</td><td><strong>'+e.name+'</strong>'+(e.note?'<br><span style="font-size:11px;color:var(--txt2)">'+e.note+'</span>':'')+'</td><td><span class="badge-sm b-red">'+e.category+'</span></td><td style="font-weight:700;color:var(--danger)">'+formatMoney(e.amount)+'</td><td><button style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:14px" onclick="deleteExpense('+e.id+')" title="Excluir">🗑</button></td></tr>';
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
      date:new Date(date).toISOString(),
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
    activeSales.forEach(function(s){paymentCounts[s.payment]=(paymentCounts[s.payment]||0)+1});
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
      '<div class="page-header"><h2>📈 Relatorios</h2><div class="header-actions">'+
      '<button class="btn btn-primary" onclick="exportReportTXT()">📤 Exportar TXT</button>'+
      '</div></div>'+

      '<div class="settings-card" style="margin-bottom:20px">'+
      '<h3>📆 Resumo Mensal — '+monthNames[curMonth]+' '+curYear+'</h3>'+
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
      '<div class="stat-card"><div class="sc-icon">💰</div><div class="sc-value">'+formatMoney(totalRevenue)+'</div><div class="sc-label">Receita Total</div></div>'+
      '<div class="stat-card"><div class="sc-icon">💸</div><div class="sc-value" style="color:var(--danger)">'+formatMoney(totalExpenses)+'</div><div class="sc-label">Despesas Total</div></div>'+
      '<div class="stat-card"><div class="sc-icon">📈</div><div class="sc-value" style="color:'+(totalProfit>=0?'var(--success)':'var(--danger)')+'">'+formatMoney(totalProfit)+'</div><div class="sc-label">Lucro Total</div></div>'+
      '<div class="stat-card"><div class="sc-icon">📊</div><div class="sc-value">'+formatMoney(avgTicket)+'</div><div class="sc-label">Ticket Medio</div></div>'+
      '<div class="stat-card"><div class="sc-icon">🛒</div><div class="sc-value">'+activeSales.length+'</div><div class="sc-label">Total de Vendas</div></div>'+
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
      '<div class="page-header"><h2>🧮 Calculadora</h2></div>'+
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
      '(':':',')':')'
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
      '<div class="page-header"><h2>📦 Meus Pedidos</h2></div>'+
      (mySales.length===0?'<div class="empty-msg" style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--rl);padding:60px"><div style="font-size:48px;margin-bottom:12px">📦</div>Nenhum pedido realizado</div>':
      '<div class="table-wrap"><table><thead><tr><th>#</th><th>Data</th><th>Itens</th><th>Total</th><th>Status</th></tr></thead><tbody>'+
      mySales.map(function(s){return '<tr><td>#'+s.id+'</td><td>'+formatDate(s.date)+'</td><td>'+s.items.length+' itens</td><td style="font-weight:700;color:var(--accent)">'+formatMoney(s.total)+'</td><td><span class="badge-sm b-green">Entregue</span></td></tr>'}).join('')+
      '</tbody></table></div>');
  }

  // ===== 1. ACTIVITY LOG =====
  function renderActivityLog(m){
    var logs=DB.activityLog||[];
    m.innerHTML=
      '<div class="page-header"><h2>📝 Log de Atividades</h2><div class="header-actions">'+
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
      '<div class="page-header"><h2>🏷️ Etiquetas de Precos</h2><div class="header-actions">'+
      '<button class="btn btn-ghost" onclick="openPromoModal()">🏷️ Gerenciar Promocoes</button>'+
      '<button class="btn btn-primary" onclick="printPriceTags()">🖨️ Imprimir Selecionados</button>'+
      '</div></div>'+
      '<div style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap">'+
      '<input type="text" class="table-search" id="tagSearch" placeholder="Buscar produto..." style="flex:1;min-width:200px">'+
      '<select class="sort-select" id="tagCatFilter" style="padding:8px 14px;border-radius:var(--r);border:1px solid var(--border);background:var(--bg2);color:var(--txt);font-family:inherit;font-size:13px"><option value="Todos">Todas categorias</option></select>'+
      '<button class="btn btn-ghost" onclick="selectAllTags()">Selecionar Todos</button>'+
      '<button class="btn btn-ghost" onclick="deselectAllTags()">Desmarcar Todos</button>'+
      '</div>'+
      '<div id="priceTagGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px"></div>'+
      '<div id="printArea" style="display:none"></div>';
    var cats=[...new Set(DB.products.map(function(p){return p.cat}))];
    var sel=$('tagCatFilter');
    cats.forEach(function(c){var o=document.createElement('option');o.value=c;o.textContent=c;sel.appendChild(o)});
    sel.addEventListener('change',renderPriceTagGrid);
    $('tagSearch').addEventListener('input',renderPriceTagGrid);
    renderPriceTagGrid();
  }
  function renderPriceTagGrid(){
    var search=(($('tagSearch')?$('tagSearch').value:'')||'').trim().toLowerCase();
    var cat=(($('tagCatFilter')?$('tagCatFilter').value:'')||'Todos');
    var items=DB.products.filter(function(p){
      return(cat==='Todos'||p.cat===cat)&&(p.name.toLowerCase().includes(search)||(p.barcode&&p.barcode.includes(search)));
    });
    var grid=$('priceTagGrid');
    grid.innerHTML=items.map(function(p){
      var hasPromo=p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price;
      var promoBadge=hasPromo?'<span class="badge-sm b-red" style="margin-left:4px">PROMO</span>':'';
      var priceDisplay='';
      if(hasPromo){
        priceDisplay='<span style="font-size:14px;color:#999;text-decoration:line-through">R$ '+p.price.toFixed(2).replace('.',',')+'</span> '+
          '<span style="font-size:24px;font-weight:900;color:#2ed573">R$ '+p.promoPrice.toFixed(2).replace('.',',')+'</span>';
      }else{
        priceDisplay='<span style="font-size:24px;font-weight:900;color:#d32f2f">R$ '+p.price.toFixed(2).replace('.',',')+'</span>';
      }
      return '<div style="background:var(--bg2);border:1px solid '+(hasPromo?'rgba(46,213,115,.4)':'var(--border)')+';border-radius:var(--r);padding:12px;cursor:pointer;transition:var(--tr)" onclick="toggleTagSelect(this)" data-id="'+p.id+'">'+
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">'+
      '<input type="checkbox" class="tag-check" data-id="'+p.id+'" style="accent-color:var(--accent);width:16px;height:16px">'+
      '<span style="font-size:20px">'+p.emoji+'</span>'+
      '<strong style="font-size:13px">'+p.name+'</strong>'+promoBadge+'</div>'+
      '<div style="background:#fff;color:#000;border-radius:6px;padding:10px;font-family:Courier New,monospace;text-align:center;border:2px dashed '+(hasPromo?'#2ed573':'#ccc')+'">'+
      '<div style="font-size:10px;color:#666">'+(getCompanyData()?(getCompanyData().fantasyName||getCompanyData().name||'PETSHOP PRADO'):'PETSHOP PRADO')+'</div>'+
      '<div style="font-size:11px;font-weight:700;margin:4px 0">'+p.name+'</div>'+
      '<div>'+priceDisplay+'</div>'+
      (hasPromo?'<div style="font-size:10px;color:#2ed573;font-weight:700;margin-top:2px">★ PROMOCAO ★</div>':'')+
      '<div style="font-size:9px;color:#999;margin-top:2px">||| '+p.barcode+' |||</div>'+
      '</div></div>';
    }).join('');
  }
  window.toggleTagSelect=function(el){var cb=el.querySelector('.tag-check');cb.checked=!cb.checked;el.style.borderColor=cb.checked?'var(--accent)':el.dataset.id&&DB.products.find(function(p){return p.id===parseInt(el.dataset.id)&&p.promoActive})?'rgba(46,213,115,.4)':'var(--border)'};
  window.selectAllTags=function(){document.querySelectorAll('.tag-check').forEach(function(cb){cb.checked=true;cb.closest('div[style]').style.borderColor='var(--accent)'})};
  window.deselectAllTags=function(){document.querySelectorAll('.tag-check').forEach(function(cb){cb.checked=false;cb.closest('div[style]').style.borderColor='var(--border)'})};

  // ===== PROMO MODAL =====
  window.openPromoModal=function(){
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
    var selected=[];
    document.querySelectorAll('.tag-check:checked').forEach(function(cb){
      var p=DB.products.find(function(x){return x.id===parseInt(cb.dataset.id)});
      if(p)selected.push(p);
    });
    if(selected.length===0){toast('Selecione pelo menos 1 produto!','error');return}
    var tagsHTML=selected.map(function(p){
      var hasPromo=p.promoActive&&p.promoPrice>0&&p.promoPrice<p.price;
      var priceHTML='';
      if(hasPromo){
        var pct=((1-p.promoPrice/p.price)*100).toFixed(0);
        priceHTML='<div style="font-size:14px;color:#999;text-decoration:line-through">R$ '+p.price.toFixed(2).replace('.',',')+'</div>'+
          '<div style="font-size:30px;font-weight:900;color:#2ed573">R$ '+p.promoPrice.toFixed(2).replace('.',',')+'</div>'+
          '<div style="font-size:11px;color:#2ed573;font-weight:700">★ PROMOCAO ★ ('+pct+'% OFF)</div>';
      }else{
        priceHTML='<div style="font-size:30px;font-weight:900;color:#d32f2f">R$ '+p.price.toFixed(2).replace('.',',')+'</div>';
      }
      return '<div style="width:220px;border:2px dashed '+(hasPromo?'#2ed573':'#ccc')+';border-radius:8px;padding:12px;text-align:center;font-family:Courier New,monospace;page-break-inside:avoid;margin:8px;display:inline-block;background:#fff;color:#000">'+
      '<div style="font-size:10px;color:#666">'+(getCompanyData()?(getCompanyData().fantasyName||getCompanyData().name||'PETSHOP PRADO'):'PETSHOP PRADO')+'</div>'+
      '<div style="font-size:12px;font-weight:700;margin:6px 0">'+p.name+'</div>'+
      priceHTML+
      '<div style="font-size:9px;color:#999;margin-top:4px">||| '+p.barcode+' |||</div></div>';
    }).join('');
    var win=window.open('','','width=800,height=600');
    win.document.write('<html><head><title>Etiquetas</title></head><body style="padding:20px;text-align:center">'+tagsHTML+'</body></html>');
    win.document.close();
    win.print();
    logActivity('ETIQUETAS',selected.length+' etiquetas geradas');
  };

  // ===== 4. BACKUP / RESTORE =====
  function renderBackup(m){
    m.innerHTML=
      '<div class="page-header"><h2>🔄 Backup / Restore</h2></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card" style="cursor:pointer" onclick="exportBackup()">'+
      '<div class="sc-icon">📤</div><div class="sc-value" style="font-size:20px">Exportar Backup</div>'+
      '<div class="sc-label">Baixar todos os dados como arquivo JSON</div></div>'+
      '<div class="stat-card" style="cursor:pointer" onclick="importBackupClick()">'+
      '<div class="sc-icon">📥</div><div class="sc-value" style="font-size:20px">Importar Backup</div>'+
      '<div class="sc-label">Restaurar dados de um arquivo JSON</div></div>'+
      '</div>'+
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
      '<input type="file" id="backupFileInput" accept=".json" style="display:none">';
    $('backupFileInput').addEventListener('change',doImportBackup);
  }
  window.exportBackup=function(){
    var blob=new Blob([JSON.stringify(DB,null,2)],{type:'application/json'});
    var url=URL.createObjectURL(blob);
    var a=document.createElement('a');
    a.href=url;a.download='petshopprado-backup-'+new Date().toISOString().slice(0,10)+'.json';
    a.click();URL.revokeObjectURL(url);
    logActivity('BACKUP','Backup exportado — '+(new Blob([JSON.stringify(DB)]).size/1024).toFixed(1)+' KB');
    toast('Backup exportado com sucesso!','success');
  };
  window.importBackupClick=function(){$('backupFileInput').click()};
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

  // ===== CLIENTS =====
  function renderClients(m){
    var activeClients=DB.clients.filter(function(c){return c.active}).length;
    var totalDogs=DB.clients.reduce(function(s,c){return s+(c.dogs?c.dogs.length:0)},0);
    m.innerHTML=
      '<div class="page-header"><h2>🧑 Cadastro de Clientes</h2><div class="header-actions">'+
      '<button class="btn btn-ghost" onclick="exportClientTXT()">📤 Exportar TXT</button>'+
      '<button class="btn btn-ghost" onclick="document.getElementById(\'importClientTXT\').click()">📥 Importar TXT</button>'+
      '<input type="file" id="importClientTXT" accept=".txt" style="display:none" onchange="importClientTXT(this)">'+
      '<button class="btn btn-primary" onclick="openClientModal()">+ Novo Cliente</button>'+
      '</div></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card"><div class="sc-icon">🧑</div><div class="sc-value">'+activeClients+'</div><div class="sc-label">Clientes Ativos</div></div>'+
      '<div class="stat-card"><div class="sc-icon">🐕</div><div class="sc-value">'+totalDogs+'</div><div class="sc-label">Pets Cadastrados</div></div>'+
      '<div class="stat-card"><div class="sc-icon">🛁</div><div class="sc-value">'+DB.bathGrooming.length+'</div><div class="sc-label">Servicos Banho/Tosa</div></div>'+
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
      var dogsHtml=c.dogs&&c.dogs.length>0?c.dogs.map(function(d,di){var ci=c.dogs.indexOf(d);return '<span class="badge-sm b-blue" style="margin:2px;display:inline-flex;align-items:center;gap:4px">'+(d.emoji||'🐕')+' '+d.name+' <button onclick="event.stopPropagation();openEditDogModal('+c.id+','+di+')" style="background:none;border:none;cursor:pointer;padding:0 2px;font-size:11px;color:var(--accent)" title="Editar Pet">✎</button><button onclick="event.stopPropagation();deleteDog('+c.id+','+di+')" style="background:none;border:none;cursor:pointer;padding:0 2px;font-size:11px;color:var(--danger)" title="Excluir Pet">✕</button></span>'}).join(''):'<span style="color:var(--txt2)">Nenhum pet</span>';
      return '<tr><td><strong>'+c.name+'</strong></td><td style="color:var(--txt2)">'+c.phone+'</td><td style="color:var(--txt2)">'+(c.cpf||'—')+'</td><td>'+dogsHtml+'</td><td>'+(c.active?'<span class="badge-sm b-green">Ativo</span>':'<span class="badge-sm b-red">Inativo</span>')+'</td><td><div class="action-btns"><button onclick="viewClientDetails('+c.id+')" title="Ver Detalhes" style="background:rgba(30,144,255,.15);color:var(--blue)">👁</button><button onclick="openClientModal('+c.id+')" title="Editar">✎</button><button onclick="openAddDogModal('+c.id+')" title="Adicionar Pet">🐕</button><button onclick="printClientCard('+c.id+')" title="Imprimir Ficha">🖨</button><button class="danger" onclick="toggleClient('+c.id+')" title="'+(c.active?'Desativar':'Ativar')+'">'+(c.active?'⏻':'✓')+'</button><button class="danger" onclick="deleteClient('+c.id+')" title="Excluir Cliente">🗑</button></div></td></tr>';
    }).join('');
  }
  window.openClientModal=function(id){
    var c=id?DB.clients.find(function(x){return x.id===id}):null;
    var body=
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
      '<div style="font-size:48px;margin-bottom:8px">'+(c.active?'🟢':'🔴')+'</div>'+
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
      '<div style="margin-bottom:8px"><span style="font-weight:700">🐕 Pets</span></div>'+
      dogsHtml+
      '<div style="margin-top:16px;margin-bottom:8px"><span style="font-weight:700">🛁 Historico de Servicos</span></div>'+
      recentBathsHtml;
    var foot='<button class="btn btn-ghost" onclick="printClientCard('+id+')">🖨 Imprimir Ficha</button><button class="btn btn-ghost" onclick="closeModal();openClientModal('+id+')">✎ Editar</button><button class="btn btn-primary" onclick="closeModal()">Fechar</button>';
    openModal('Detalhes — '+c.name,html,foot);
  };

  // ===== DELETE CLIENT =====
  window.deleteClient=function(id){
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
    openModal('Ficha — '+c.name,html,'<button class="btn btn-ghost" onclick="printClientCardWindow()">🖨 Imprimir</button><button class="btn btn-primary" onclick="closeModal()">Fechar</button>','modal-receipt');
  };
  window.printClientCardWindow=function(){
    var content=document.getElementById('clientCardContent');
    if(!content)return;
    var win=window.open('','_blank','width=320,height=600');
    win.document.write('<html><head><title>Ficha do Cliente</title><style>'+
      'body{font-family:monospace;font-size:12px;padding:16px;max-width:300px;margin:0 auto}'+
      '.r-header{text-align:center;margin-bottom:8px}.r-header h3{margin:0;font-size:14px}'+
      '.r-header p{margin:2px 0;font-size:11px;color:#666}'+
      '.r-item{display:flex;justify-content:space-between;padding:4px 0;font-size:12px}'+
      '.r-divider{border:none;border-top:1px dashed #ccc;margin:6px 0}'+
      '.r-footer{text-align:center;margin-top:12px;font-size:10px;color:#666}'+
      '</style></head><body>'+content.innerHTML+'</body></html>');
    win.document.close();
    setTimeout(function(){win.print();win.close()},500);
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
            name:petMatch[1].trim().replace(/^[\u{1F400}-\u{1F4FF}]\s*/u,''),
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
      '<div class="page-header"><h2>🛁 Banho & Tosa</h2><div class="header-actions">'+
      '<button class="btn btn-ghost" onclick="openWaitingListModal()">⏳ Lista de Espera ('+waitingList+')</button>'+
      '<button class="btn btn-primary" onclick="openBathModal()">+ Novo Agendamento</button>'+
      '</div></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card"><div class="sc-icon">📅</div><div class="sc-value" style="color:var(--blue)">'+agendados+'</div><div class="sc-label">Agendados</div></div>'+
      '<div class="stat-card"><div class="sc-icon">🔄</div><div class="sc-value" style="color:#f39c12">'+andamento+'</div><div class="sc-label">Em Andamento</div></div>'+
      '<div class="stat-card"><div class="sc-icon">✅</div><div class="sc-value" style="color:var(--success)">'+concluidos+'</div><div class="sc-label">Concluidos</div></div>'+
      '<div class="stat-card"><div class="sc-icon">❌</div><div class="sc-value" style="color:var(--danger)">'+cancelados+'</div><div class="sc-label">Cancelados</div></div>'+
      '<div class="stat-card"><div class="sc-icon">💰</div><div class="sc-value">'+formatMoney(totalFaturado)+'</div><div class="sc-label">Faturamento</div></div>'+
      '<div class="stat-card"><div class="sc-icon">⏳</div><div class="sc-value" style="color:#f39c12">'+waitingList+'</div><div class="sc-label">Lista de Espera</div></div>'+
      '</div>'+
      '<div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center">'+
      '<button class="btn btn-ghost bath-filter active" data-filter="all">Todos</button>'+
      '<button class="btn btn-ghost bath-filter" data-filter="Agendado">📅 Agendados</button>'+
      '<button class="btn btn-ghost bath-filter" data-filter="Em andamento">🔄 Em Andamento</button>'+
      '<button class="btn btn-ghost bath-filter" data-filter="Concluido">✅ Concluidos</button>'+
      '<button class="btn btn-ghost bath-filter" data-filter="Cancelado">❌ Cancelados</button>'+
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
      '<button class="btn btn-ghost" onclick="openBathReportModal()" style="font-size:12px;padding:6px 12px">📊 Relatorio</button>'+
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
      var dogEmoji='🐕';
      if(client&&client.dogs){
        var dog=client.dogs.find(function(d){return d.name===b.dogName});
        if(dog&&dog.emoji)dogEmoji=dog.emoji;
      }
      var actions='<div class="action-btns">';
      actions+='<button onclick="viewBathDetails('+b.id+')" title="Ver Detalhes" style="background:rgba(30,144,255,.15);color:var(--blue)">👁</button>';
      actions+='<button onclick="openBathModal('+b.id+')" title="Editar">✎</button>';
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
        actions+='<button onclick="rescheduleBath('+b.id+')" title="Reagendar" style="background:rgba(0,188,212,.15);color:#00bcd4">📅</button>';
        actions+='<button onclick="duplicateBath('+b.id+')" title="Duplicar" style="background:rgba(156,39,176,.15);color:#9c27b0">📋</button>';
      }
      if(b.status!=='Cancelado'&&b.status!=='Concluido'){
        actions+='<button class="danger" onclick="cancelBath('+b.id+')" title="Cancelar">✕</button>';
      }
      actions+='</div>';
      var payLabel=b.packageId?'Dinheiro (Pacote)':(b.paymentMethod||'Dinheiro');
      var payClass=b.packageId?'b-purple':b.paymentMethod==='PIX'?'b-blue':b.paymentMethod==='Cartao'?'b-yellow':'b-green';
      var ratingHtml=b.rating?'<span style="color:#ffc107">'+('⭐'.repeat(b.rating))+'</span>':'<span style="color:var(--txt2);font-size:11px">—</span>';
      return '<tr><td><span style="font-size:18px;margin-right:4px">'+dogEmoji+'</span> <strong>'+b.dogName+'</strong></td><td>'+(client?client.name:'—')+'</td><td><span class="badge-sm b-purple">'+b.service+'</span></td><td>'+formatDate(b.date)+'</td><td style="color:var(--txt2)">'+b.professional+'</td><td style="font-weight:700;color:var(--accent)">'+formatMoney(b.price)+'</td><td><span class="badge-sm '+payClass+'">'+payLabel+'</span></td><td><span class="badge-sm '+statusClass+'">'+b.status+'</span></td><td>'+ratingHtml+'</td><td>'+actions+'</td></tr>';
    }).join('');
    if(items.length===0)$('bathTableBody').innerHTML='<tr><td colspan="10" class="empty-msg">Nenhum registro encontrado</td></tr>';
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
      '<div style="font-size:36px;margin-bottom:8px">🛁</div>'+
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
      (b.packageId?'<div style="font-size:11px;margin-top:4px;color:'+(b.creditDebited?'var(--success)':'#f39c12')+'">'+(b.creditDebited?'✓ Credito debitado — registrado como Dinheiro':'⏳ Credito pendente (sera debitado como Dinheiro na conclusao)')+'</div>':'')+
      '</div>'+
      '</div>'+
      dogInfo+
      (b.notes?'<div style="padding:12px;background:var(--bg3);border-radius:var(--r);margin-bottom:12px"><span style="color:var(--txt2);font-size:12px">Observacoes</span><div style="font-size:13px;margin-top:4px">'+b.notes+'</div></div>':'');
    var foot='<button class="btn btn-ghost" onclick="printBathReceipt('+b.id+')">🖨 Comprovante</button>';
    if(b.status==='Agendado')foot+=' <button class="btn btn-ghost" style="color:#f39c12" onclick="closeModal();startBath('+b.id+')">▶ Iniciar</button>';
    if(b.status==='Em andamento'||b.status==='Agendado')foot+=' <button class="btn btn-ghost" style="color:var(--success)" onclick="closeModal();completeBath('+b.id+')">✓ Concluir</button>';
    if(b.packageId&&!b.creditDebited&&b.status!=='Concluido'&&b.status!=='Cancelado'){
      foot+=' <button class="btn btn-ghost" style="color:var(--accent)" onclick="closeModal();debitBathCredit('+b.id+')" title="Debitar credito do pacote">🎫 Debitar Credito</button>';
    }
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
      '<div style="font-size:48px;margin-bottom:12px">✅</div>'+
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
    if(b.paymentMethod==='Pacote'&&b.packageId&&!b.creditDebited){
      var pkg=DB.clientPackages.find(function(p){return p.id===b.packageId});
      if(pkg){
        pkg.usedCredits++;
        b.creditDebited=true;
        b.paymentMethod='Dinheiro';
        logActivity('PACOTE_DEBITADO','Pacote #'+b.packageId+' — '+b.service+' — '+b.dogName+' — Credito debitado (pagamento em Dinheiro)');
      }
    }
    logActivity('BATH_CONCLUIDO',b.dogName+' — '+b.service+' — '+formatMoney(b.price));
    saveDB();closeModal();renderBathGrooming($('mainContent'));
    toast('Servico concluido!'+(b.creditDebited?' (1 credito debitado do pacote — registrado como Dinheiro)':''),'success');
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
    var creditReturned=false;
    if(b.packageId&&b.creditDebited){
      var pkg=DB.clientPackages.find(function(p){return p.id===b.packageId});
      if(pkg&&pkg.usedCredits>0){
        pkg.usedCredits--;
        b.creditDebited=false;
        creditReturned=true;
        logActivity('PACOTE_ESTORNADO','Pacote #'+b.packageId+' — 1 credito devolvido');
      }
    }
    b.status='Cancelado';
    b.cancelledAt=new Date().toISOString();
    logActivity('BATH_CANCELADO',b.dogName+' — '+b.service+' — '+formatMoney(b.price));
    saveDB();closeModal();renderBathGrooming($('mainContent'));
    toast('Agendamento cancelado'+(creditReturned?' e credito devolvido ao pacote':''),'info');
  };

  // Debitar credito do pacote manualmente
  window.debitBathCredit=function(id){
    var b=DB.bathGrooming.find(function(x){return x.id===id});
    if(!b)return;
    var pkg=b.packageId?DB.clientPackages.find(function(p){return p.id===b.packageId}):null;
    if(!pkg){toast('Pacote nao encontrado!','error');return}
    var remaining=pkg.totalCredits-p.usedCredits;
    var body='<div style="text-align:center;padding:16px 0">'+
      '<div style="font-size:48px;margin-bottom:12px">🎫</div>'+
      '<div style="font-size:16px;font-weight:700;margin-bottom:8px">Debitar 1 credito do pacote?</div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r);margin-bottom:12px">'+
      '<div style="font-size:13px;color:var(--txt2)">Pacote: <strong>#'+pkg.id+' — '+pkg.serviceName+'</strong></div>'+
      '<div style="font-size:13px;color:var(--txt2)">Creditos restantes: <strong>'+remaining+'</strong></div>'+
      '<div style="font-size:13px;color:var(--txt2)">Apos debito: <strong>'+(remaining-1)+'</strong></div>'+
      '</div>'+
      '<div style="font-size:12px;color:var(--txt2)">Servico: '+b.service+' — '+b.dogName+'</div></div>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>'+
      '<button class="btn btn-primary" onclick="confirmDebitBathCredit('+id+')">🎫 Confirmar Debito</button>';
    openModal('Debitar Credito do Pacote',body,foot);
  };
  window.confirmDebitBathCredit=function(id){
    var b=DB.bathGrooming.find(function(x){return x.id===id});
    if(!b)return;
    var pkg=b.packageId?DB.clientPackages.find(function(p){return p.id===b.packageId}):null;
    if(!pkg){toast('Pacote nao encontrado!','error');return}
    if(b.creditDebited){toast('Credito ja foi debitado!','error');return}
    if(pkg.usedCredits>=pkg.totalCredits){toast('Pacote sem creditos disponiveis!','error');return}
    pkg.usedCredits++;
    b.creditDebited=true;
    b.paymentMethod='Dinheiro';
    logActivity('PACOTE_DEBITADO','Pacote #'+b.packageId+' — '+b.service+' — '+b.dogName+' — Debito manual — registrado como Dinheiro');
    saveDB();closeModal();renderBathGrooming($('mainContent'));
    toast('Credito debitado com sucesso! (registrado como Dinheiro)','success');
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
      '<label>Nova Data e Hora</label><input type="datetime-local" id="rescheduleDate" value="'+new Date(b.date).toISOString().slice(0,16)+'">'+
      '<label>Manter profissional: <strong>'+b.professional+'</strong></label>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>'+
      '<button class="btn btn-primary" onclick="confirmRescheduleBath('+id+')">📅 Reagendar</button>';
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
      '<label>Data e Hora do Novo Agendamento</label><input type="datetime-local" id="duplicateDate" value="'+new Date(Date.now()+86400000).toISOString().slice(0,16)+'">'+
      '<label>Forma de Pagamento</label><select id="duplicatePayment">'+
      '<option value="Dinheiro">Dinheiro</option><option value="PIX">PIX</option><option value="Cartao">Cartao</option>'+
      '</select>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>'+
      '<button class="btn btn-primary" onclick="confirmDuplicateBath('+id+')">📋 Duplicar</button>';
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
    openModal('⏳ Lista de Espera',body,foot);
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
  window.promoteFromWaitingList=function(id){
    var item=(DB.waitingList||[]).find(function(w){return w.id===id});
    if(!item)return;
    openWaitingListModal();
    closeModal();
    setTimeout(function(){
      openBathModal();
      setTimeout(function(){
        if($('bClientId')){$('bClientId').value=item.clientId;updateDogSelect(item.dogName);$('bService').value=item.service}
      },200);
    },200);
    DB.waitingList=DB.waitingList.filter(function(w){return w.id!==id});
    saveDB();
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
        '<button class="btn btn-ghost" onclick="promoteFromWaitingList('+w.id+')" title="Criar Agendamento" style="font-size:12px;padding:4px 8px;background:rgba(46,213,115,.15);color:var(--success)">📅 Agendar</button>'+
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
        '<div style="font-size:16px;font-weight:700">👤 '+pro+'</div>'+
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
    openModal('📊 Relatorio por Profissional',html,foot,'modal-report');
  };

  // Abrir modal de agendamento (com opcao de cadastrar pet)
  window.openBathModal=function(id){
    var b=id?DB.bathGrooming.find(function(x){return x.id===id}):null;
    var activeClients=DB.clients.filter(function(c){return c.active});
    var services=DB.services.filter(function(s){return s.active});
    var professionals=DB.employees.filter(function(e){return e.active}).map(function(e){return e.name});
    var dateValue=b?new Date(b.date).toISOString().slice(0,16):new Date().toISOString().slice(0,16);
    var paymentMethods=['Dinheiro','Cartao','PIX','Pacote'];
    var body=
      '<label>Cliente</label><div style="display:flex;gap:8px"><select id="bClientId" onchange="updateDogSelect();updatePkgOptions()" style="flex:1">'+
      '<option value="">Selecione o cliente...</option>'+
      activeClients.map(function(c){return '<option value="'+c.id+'"'+(b&&b.clientId===c.id?' selected':'')+'>'+c.name+' ('+c.phone+')</option>'}).join('')+'</select>'+
      '<button class="btn btn-ghost" onclick="openAddDogFromBath()" title="Cadastrar novo pet" style="white-space:nowrap;padding:8px 12px">🐕 + Pet</button></div>'+
      '<label>Pet</label><div style="display:flex;gap:8px"><select id="bDogName" style="flex:1"><option value="">Selecione o pet...</option></select>'+
      '<button class="btn btn-ghost" onclick="openAddDogFromBath()" title="Cadastrar novo pet para este cliente" style="white-space:nowrap;padding:8px 12px;font-size:12px">+ Novo</button></div>'+
      '<label>Servico</label><select id="bService" onchange="updatePkgOptions()">'+services.map(function(s){return '<option value="'+s.name+'"'+(b&&b.service===s.name?' selected':'')+'>'+s.name+' — '+formatMoney(s.price)+'</option>'}).join('')+'</select>'+
      '<label>Data e Hora</label><input type="datetime-local" id="bDate" value="'+dateValue+'">'+
      '<label>Profissional</label><select id="bProfessional">'+professionals.map(function(p){return '<option'+(b&&b.professional===p?' selected':'')+'>'+p+'</option>'}).join('')+'</select>'+
      '<label>Forma de Pagamento</label><select id="bPayment" onchange="updatePkgOptions()">'+
      paymentMethods.map(function(pm){return '<option value="'+pm+'"'+(b&&b.paymentMethod===pm?' selected':'')+'>'+pm+'</option>'}).join('')+'</select>'+
      '<div id="bPkgRow" style="display:none"><label>Pacote (Credito)</label><select id="bPackageId"><option value="">Selecione o pacote...</option></select></div>'+
      '<label>Valor (R$)</label><input type="number" step="0.01" id="bPrice" value="'+(b?b.price:'')+'">'+
      '<label>Observacoes</label><textarea id="bNotes" rows="2">'+(b?b.notes||'':'')+'</textarea>';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveBath('+(id?id:'null')+')">'+(b?'Salvar':'Agendar')+'</button>';
    openModal(b?'Editar Agendamento':'Novo Agendamento de Banho & Tosa',body,foot);
    if(b&&b.clientId){setTimeout(function(){updateDogSelect(b.dogName);updatePkgOptions()},100)}
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
      '<button class="btn btn-primary" onclick="saveDogFromBath('+clientId+')">🐕 Cadastrar Pet</button>';
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
  window.updatePkgOptions=function(){
    var payment=$('bPayment')?$('bPayment').value:'';
    var pkgRow=$('bPkgRow');
    var pkgSel=$('bPackageId');
    if(payment==='Pacote'){
      var clientId=parseInt($('bClientId').value)||0;
      var serviceName=$('bService')?$('bService').value:'';
      pkgRow.style.display='block';
      pkgSel.innerHTML='<option value="">Selecione o pacote...</option>';
      var available=DB.clientPackages.filter(function(p){
        return p.clientId===clientId&&p.serviceName===serviceName&&p.active&&p.usedCredits<p.totalCredits&&(!p.expiryDate||new Date(p.expiryDate)>=new Date());
      });
      available.forEach(function(p){
        var remaining=p.totalCredits-p.usedCredits;
        var opt=document.createElement('option');
        opt.value=p.id;
        opt.textContent='Pacote #'+p.id+' — '+remaining+' creditos restantes';
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
      if(pkg.usedCredits>=pkg.totalCredits){toast('Pacote sem creditos disponiveis!','error');return}
      var svc=DB.services.find(function(s){return s.name===service});
      price=svc?svc.price:pkg.totalCredits>0?pkg.price/pkg.totalCredits:0;
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
        if(oldBath.packageId&&oldBath.creditDebited&&!data.packageId){
          var oldPkg=DB.clientPackages.find(function(p){return p.id===oldBath.packageId});
          if(oldPkg){oldPkg.usedCredits--;oldBath.creditDebited=false;logActivity('PACOTE_ESTORNADO','Pacote #'+oldBath.packageId+' — credito devolvido (pacote removido)')}
        }
        if(data.packageId&&!data.creditDebited){
          if(!oldBath.packageId||oldBath.packageId!==data.packageId){
            var newPkg=DB.clientPackages.find(function(p){return p.id===data.packageId});
            if(newPkg){data.creditDebited=true}
          }
        }
        DB.bathGrooming[idx]=Object.assign(DB.bathGrooming[idx],data);
      }
      logActivity('BATH_EDITADO','Agendamento: '+dogName+' — '+service);
      toast('Agendamento atualizado!','success');
    }else{
      data.id=genId('bath');
      data.status='Agendado';
      data.creditDebited=false;
      DB.bathGrooming.push(data);
      logActivity('BATH_CRIADO','Agendamento: '+dogName+' — '+service+' — '+formatMoney(price)+' — '+paymentMethod+(paymentMethod==='Pacote'?' (credito sera debitado na conclusao — registrado como Dinheiro)':''));
      toast('Agendamento criado!'+(paymentMethod==='Pacote'?' (credito sera debitado na conclusao — sera registrado como Dinheiro)':''),'success');
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
      '<div class="r-item"><span>Pagamento:</span><span>'+(b.packageId?'Dinheiro (via Pacote #'+b.packageId+')':(b.paymentMethod||'Dinheiro'))+'</span></div>'+
      '<hr class="r-divider">'+
      '<div class="r-total"><span>TOTAL</span><span>'+formatMoney(b.price)+'</span></div>'+
      '<hr class="r-divider">'+
      '<div class="r-item"><span>Status:</span><span>'+b.status+'</span></div>'+
      (b.notes?'<div class="r-item"><span>Obs:</span><span>'+b.notes+'</span></div>':'')+
      '<hr class="r-divider">'+
      '<div class="r-footer">Obrigado pela preferencia!<br>'+coName+'</div></div>';
    openModal('Comprovante — '+b.dogName,html,'<button class="btn btn-ghost" onclick="printBathReceiptWindow()">🖨 Imprimir</button><button class="btn btn-primary" onclick="closeModal()">Fechar</button>','modal-receipt');
  };
  window.printBathReceiptWindow=function(){
    var content=document.getElementById('bathReceiptContent');
    if(!content)return;
    var win=window.open('','_blank','width=320,height=600');
    win.document.write('<html><head><title>Comprovante</title><style>'+
      'body{font-family:monospace;font-size:12px;padding:16px;max-width:300px;margin:0 auto}'+
      '.r-header{text-align:center;margin-bottom:8px}.r-header h3{margin:0;font-size:14px}'+
      '.r-header p{margin:2px 0;font-size:11px;color:#666}'+
      '.r-item{display:flex;justify-content:space-between;padding:4px 0;font-size:12px}'+
      '.r-total{display:flex;justify-content:space-between;font-size:16px;font-weight:900;padding:8px 0;border-top:2px dashed #000;margin-top:8px}'+
      '.r-divider{border:none;border-top:1px dashed #ccc;margin:6px 0}'+
      '.r-footer{text-align:center;margin-top:12px;font-size:10px;color:#666}'+
      '</style></head><body>'+content.innerHTML+'</body></html>');
    win.document.close();
    setTimeout(function(){win.print();win.close()},500);
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
      '<div class="page-header"><h2>🛎️ Cadastro de Servicos</h2><div class="header-actions">'+
      '<button class="btn btn-primary" onclick="openServiceModal()">+ Novo Servico</button>'+
      '</div></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card"><div class="sc-icon">🛎️</div><div class="sc-value">'+activeServices+'</div><div class="sc-label">Servicos Ativos</div></div>'+
      '<div class="stat-card"><div class="sc-icon">💵</div><div class="sc-value" style="color:var(--accent)">'+formatMoney(avgPrice)+'</div><div class="sc-label">Preco Medio</div></div>'+
      '<div class="stat-card"><div class="sc-icon">🛁</div><div class="sc-value">'+totalBaths+'</div><div class="sc-label">Agendamentos</div></div>'+
      '<div class="stat-card"><div class="sc-icon">⭐</div><div class="sc-value" style="font-size:14px">'+mostUsed+'</div><div class="sc-label">Mais Utilizado</div></div>'+
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
      return '<tr><td><strong>'+s.name+'</strong></td><td style="font-weight:700;color:var(--accent)">'+formatMoney(s.price)+'</td><td style="color:var(--txt2)">'+s.duration+' min</td><td style="color:var(--txt2);max-width:250px">'+(s.description||'—')+'</td><td><span class="badge-sm b-purple">'+usageCount+'</span></td><td>'+(s.active?'<span class="badge-sm b-green">Ativo</span>':'<span class="badge-sm b-red">Inativo</span>')+'</td><td><div class="action-btns"><button onclick="openServiceModal('+s.id+')" title="Editar">✎</button><button class="danger" onclick="toggleService('+s.id+')" title="'+(s.active?'Desativar':'Ativar')+'">'+(s.active?'⏻':'✓')+'</button></div></td></tr>';
    }).join('');
    if(items.length===0)$('serviceTableBody').innerHTML='<tr><td colspan="7" class="empty-msg">Nenhum servico encontrado</td></tr>';
  }
  window.openServiceModal=function(id){
    var s=id?DB.services.find(function(x){return x.id===id}):null;
    var body=
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

  // ===== CLIENT PACKAGES (PACOTES) =====
  function renderPackages(m){
    var totalPackages=DB.clientPackages.length;
    var activePackages=DB.clientPackages.filter(function(p){return p.active&&p.usedCredits<p.totalCredits}).length;
    var totalCredits=DB.clientPackages.reduce(function(s,p){return s+p.totalCredits},0);
    var usedCredits=DB.clientPackages.reduce(function(s,p){return s+p.usedCredits},0);
    var totalRevenue=DB.clientPackages.reduce(function(s,p){return s+p.price},0);
    m.innerHTML=
      '<div class="page-header"><h2>🎫 Pacotes de Servicos</h2><div class="header-actions">'+
      '<button class="btn btn-primary" onclick="openPackageModal()">+ Novo Pacote</button>'+
      '</div></div>'+
      '<div class="stats-row">'+
      '<div class="stat-card"><div class="sc-icon">🎫</div><div class="sc-value">'+activePackages+'</div><div class="sc-label">Pacotes Ativos</div></div>'+
      '<div class="stat-card"><div class="sc-icon">📊</div><div class="sc-value">'+usedCredits+'/'+totalCredits+'</div><div class="sc-label">Creditos Usados</div></div>'+
      '<div class="stat-card"><div class="sc-icon">💰</div><div class="sc-value" style="color:var(--accent)">'+formatMoney(totalRevenue)+'</div><div class="sc-label">Faturamento Pacotes</div></div>'+
      '<div class="stat-card"><div class="sc-icon">⏳</div><div class="sc-value">'+(totalCredits-usedCredits)+'</div><div class="sc-label">Creditos Disponiveis</div></div>'+
      '</div>'+
      '<div class="table-wrap"><div class="table-header"><h3>'+totalPackages+' pacotes</h3>'+
      '<input type="text" class="table-search" id="pkgSearch" placeholder="Buscar pacote..."></div>'+
      '<table><thead><tr><th>Cliente</th><th>Servico</th><th>Progresso</th><th>Utilizados</th><th>Restantes</th><th>Validade</th><th>Status</th><th>Acoes</th></tr></thead>'+
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
      var remaining=p.totalCredits-p.usedCredits;
      var isExpired=p.expiryDate&&new Date(p.expiryDate)<new Date();
      var isEmpty=remaining<=0;
      var statusText=isEmpty?'Esgotado':isExpired?'Vencido':p.active?'Ativo':'Inativo';
      var statusClass=isEmpty?'b-red':isExpired?'b-yellow':p.active?'b-green':'b-red';
      var expiryFormatted=p.expiryDate?new Date(p.expiryDate).toLocaleDateString('pt-BR'):'Sem prazo';
      var progressPercent=p.totalCredits>0?Math.round((p.usedCredits/p.totalCredits)*100):0;
      var progressColor=progressPercent>=100?'var(--danger)':progressPercent>=70?'#f39c12':'var(--success)';
      var progressBar='<div style="width:100%;min-width:120px">'+
        '<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;color:var(--txt2)">'+p.usedCredits+' usado(s) de '+p.totalCredits+' sessoes</div>'+
        '<div style="width:100%;height:8px;background:var(--bg3);border-radius:4px;overflow:hidden">'+
        '<div style="width:'+progressPercent+'%;height:100%;background:'+progressColor+';border-radius:4px;transition:width .3s"></div>'+
        '</div>'+
        '<div style="text-align:right;font-size:10px;color:var(--txt2);margin-top:2px">'+progressPercent+'% concluido</div>'+
        '</div>';
      return '<tr><td><strong>'+(client?client.name:'—')+'</strong></td><td><span class="badge-sm b-purple">'+p.serviceName+'</span></td><td>'+progressBar+'</td><td style="font-weight:700">'+p.usedCredits+'</td><td style="font-weight:700;color:'+(remaining>0?'var(--accent)':'var(--danger)')+'">'+remaining+'</td><td style="color:var(--txt2)">'+expiryFormatted+'</td><td><span class="badge-sm '+statusClass+'">'+statusText+'</span></td><td><div class="action-btns"><button onclick="viewPackageDetails('+p.id+')" title="Ver Detalhes" style="background:rgba(30,144,255,.15);color:var(--blue)">👁</button><button onclick="openPackageModal('+p.id+')" title="Editar">✎</button><button class="danger" onclick="deletePackage('+p.id+')" title="Excluir">🗑</button></div></td></tr>';
    }).join('');
    if(items.length===0)$('pkgTableBody').innerHTML='<tr><td colspan="8" class="empty-msg">Nenhum pacote encontrado</td></tr>';
  }
  window.openPackageModal=function(id){
    var p=id?DB.clientPackages.find(function(x){return x.id===id}):null;
    var activeClients=DB.clients.filter(function(c){return c.active});
    var activeServices=DB.services.filter(function(s){return s.active});
    var body=
      '<label>Cliente</label><select id="pkgClientId" onchange="updatePkgServicePrice()">'+
      '<option value="">Selecione o cliente...</option>'+
      activeClients.map(function(c){return '<option value="'+c.id+'"'+(p&&p.clientId===c.id?' selected':'')+'>'+c.name+' ('+c.phone+')</option>'}).join('')+'</select>'+
      '<label>Servico</label><select id="pkgServiceName" onchange="updatePkgServicePrice()">'+
      '<option value="">Selecione o servico...</option>'+
      activeServices.map(function(s){return '<option value="'+s.name+'" data-price="'+s.price+'"'+(p&&p.serviceName===s.name?' selected':'')+'>'+s.name+' — '+formatMoney(s.price)+'/sessao</option>'}).join('')+'</select>'+
      '<label>Quantidade de Sessoes</label><input type="number" id="pkgCredits" min="1" value="'+(p?p.totalCredits:'5')+'" onchange="updatePkgTotal()">'+
      '<label>Valor Total (R$)</label><input type="number" id="pkgPrice" step="0.01" min="0" value="'+(p?p.price:'')+'" placeholder="0.00">'+
      '<div id="pkgPriceInfo" style="font-size:12px;color:var(--txt2);margin-bottom:12px"></div>'+
      '<label>Data de Validade</label><input type="date" id="pkgExpiry" value="'+(p&&p.expiryDate?p.expiryDate.slice(0,10):'')+'">'+
      '<div style="font-size:12px;color:var(--txt2);margin-bottom:12px">Deixe vazio para pacote sem prazo de validade</div>'+
      '<label>Observacoes</label><input type="text" id="pkgNotes" value="'+(p&&p.notes?p.notes:'')+'" placeholder="Observacoes opcionais">';
    var foot='<button class="btn btn-ghost" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="savePackage('+(id?id:'null')+')">'+(p?'Salvar':'Criar Pacote')+'</button>';
    openModal(p?'Editar Pacote':'Novo Pacote',body,foot);
  };
  window.updatePkgServicePrice=function(){
    var sel=$('pkgServiceName');
    if(!sel)return;
    var opt=sel.options[sel.selectedIndex];
    var price=opt?parseFloat(opt.dataset.price)||0:0;
    var credits=parseInt($('pkgCredits').value)||1;
    $('pkgPrice').value=(price*credits).toFixed(2);
    updatePkgTotal();
  };
  window.updatePkgTotal=function(){
    var sel=$('pkgServiceName');
    if(!sel||!$('pkgPriceInfo'))return;
    var opt=sel.options[sel.selectedIndex];
    var unitPrice=opt?parseFloat(opt.dataset.price)||0:0;
    var credits=parseInt($('pkgCredits').value)||1;
    var total=parseFloat($('pkgPrice').value)||0;
    var perSession=credits>0?total/credits:0;
    var economy=unitPrice*credits-total;
    $('pkgPriceInfo').innerHTML='Valor por sessao: <strong>'+formatMoney(perSession)+'</strong>'+
      (economy>0?' | Economia: <strong style="color:var(--success)">'+formatMoney(economy)+'</strong>':'');
  };
  window.savePackage=function(id){
    var clientId=parseInt($('pkgClientId').value)||0;
    var serviceName=$('pkgServiceName').value;
    var totalCredits=parseInt($('pkgCredits').value)||0;
    var price=parseFloat($('pkgPrice').value)||0;
    var expiryDate=$('pkgExpiry').value;
    var notes=$('pkgNotes').value.trim();
    if(!clientId){toast('Selecione um cliente!','error');return}
    if(!serviceName){toast('Selecione um servico!','error');return}
    if(totalCredits<=0){toast('Quantidade de sessoes deve ser maior que zero!','error');return}
    if(price<=0){toast('Valor total deve ser maior que zero!','error');return}
    if(id){
      var idx=DB.clientPackages.findIndex(function(x){return x.id===id});
      if(idx!==-1){
        var oldUsed=DB.clientPackages[idx].usedCredits;
        DB.clientPackages[idx].clientId=clientId;
        DB.clientPackages[idx].serviceName=serviceName;
        DB.clientPackages[idx].totalCredits=totalCredits;
        DB.clientPackages[idx].price=price;
        DB.clientPackages[idx].expiryDate=expiryDate?new Date(expiryDate).toISOString():null;
        DB.clientPackages[idx].notes=notes;
        if(totalCredits<oldUsed)DB.clientPackages[idx].usedCredits=totalCredits;
      }
      logActivity('PACOTE_EDITADO','Pacote #'+id+' — '+serviceName);
      toast('Pacote atualizado!','success');
    }else{
      var pkg={
        id:genId('package'),
        clientId:clientId,
        serviceName:serviceName,
        totalCredits:totalCredits,
        usedCredits:0,
        price:price,
        purchaseDate:new Date().toISOString(),
        expiryDate:expiryDate?new Date(expiryDate).toISOString():null,
        notes:notes,
        active:true
      };
      DB.clientPackages.push(pkg);
      var client=DB.clients.find(function(c){return c.id===clientId});
      logActivity('PACOTE_CRIADO','Pacote: '+serviceName+' — '+totalCredits+' sessoes — Cliente: '+(client?client.name:''));
      toast('Pacote criado com sucesso!','success');
    }
    saveDB();closeModal();renderPackageTable();
  };
  window.deletePackage=function(id){
    var p=DB.clientPackages.find(function(x){return x.id===id});
    if(p&&p.usedCredits>0){
      if(!confirm('Este pacote ja foi utilizado '+p.usedCredits+' vez(es). Deseja excluir mesmo assim?'))return;
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
    var remaining=p.totalCredits-p.usedCredits;
    var isExpired=p.expiryDate&&new Date(p.expiryDate)<new Date();
    var perSession=p.totalCredits>0?p.price/p.totalCredits:0;
    var bathRecords=DB.bathGrooming.filter(function(b){return b.packageId===id});
    var historyHtml='';
    if(bathRecords.length>0){
      historyHtml='<table style="width:100%;font-size:12px;margin-top:8px"><thead><tr><th>Data</th><th>Pet</th><th>Profissional</th><th>Status</th></tr></thead><tbody>'+
        bathRecords.map(function(b){
          var sc=b.status==='Concluido'?'b-green':b.status==='Cancelado'?'b-red':'b-blue';
          return '<tr><td>'+formatDate(b.date)+'</td><td>'+b.dogName+'</td><td>'+b.professional+'</td><td><span class="badge-sm '+sc+'">'+b.status+'</span></td></tr>';
        }).join('')+'</tbody></table>';
    }else{
      historyHtml='<div style="text-align:center;padding:12px;color:var(--txt2)">Nenhum uso registrado</div>';
    }
    var html=
      '<div style="text-align:center;margin-bottom:16px;padding:16px;background:var(--bg3);border-radius:var(--r)">'+
      '<div style="font-size:48px;margin-bottom:8px">🎫</div>'+
      '<div style="font-size:18px;font-weight:900;color:var(--accent)">'+p.serviceName+'</div>'+
      '<div style="margin-top:4px;color:var(--txt2)">Pacote #'+p.id+'</div>'+
      '</div>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r)"><span style="color:var(--txt2);font-size:12px">Cliente</span><div style="font-weight:700">'+(client?client.name:'—')+'</div></div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r)"><span style="color:var(--txt2);font-size:12px">Valor Pago</span><div style="font-weight:700;color:var(--accent)">'+formatMoney(p.price)+'</div></div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r);text-align:center"><div style="font-size:24px;font-weight:900;color:var(--accent)">'+remaining+'</div><div style="font-size:11px;color:var(--txt2)">Restantes</div></div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r);text-align:center"><div style="font-size:24px;font-weight:900">'+p.usedCredits+'/'+p.totalCredits+'</div><div style="font-size:11px;color:var(--txt2)">Utilizados</div></div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r)"><span style="color:var(--txt2);font-size:12px">Valor/Sessao</span><div style="font-weight:700">'+formatMoney(perSession)+'</div></div>'+
      '<div style="padding:12px;background:var(--bg3);border-radius:var(--r)"><span style="color:var(--txt2);font-size:12px">Validade</span><div style="font-weight:700">'+(p.expiryDate?new Date(p.expiryDate).toLocaleDateString('pt-BR'):'Sem prazo')+(isExpired?' <span style="color:var(--danger)">(Vencido)</span>':'')+'</div></div>'+
      '</div>'+
      (p.notes?'<div style="padding:12px;background:var(--bg3);border-radius:var(--r);margin-bottom:12px"><span style="color:var(--txt2);font-size:12px">Observacoes</span><div style="font-size:13px;margin-top:4px">'+p.notes+'</div></div>':'')+
      '<div style="margin-bottom:8px"><span style="font-weight:700">📋 Historico de Uso</span></div>'+
      historyHtml;
    var foot='<button class="btn btn-primary" onclick="closeModal()">Fechar</button>';
    openModal('Pacote — '+p.serviceName,html,foot);
  };

  // ===== DATABASE CONFIG =====
  function renderDbConfig(m){
    var cfg=PetShopDB.config;
    var isRemote=cfg.type==='remote';
    var hasPw=cfg.hasPassword;
    var dataSize=(new Blob([JSON.stringify(PetShopDB.data)]).size/1024).toFixed(1);
    m.innerHTML=
      '<div class="page-header"><h2>🗄️ Configuracao do Banco de Dados</h2></div>'+

      '<div class="settings-card">'+
      '<h3>📡 Tipo de Armazenamento</h3>'+
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
      '<div class="settings-card">'+
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
      '<h3>📊 Status Atual</h3>'+
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
      '<div class="page-header"><h2>🏢 Cadastro da Empresa</h2></div>'+

      '<div class="settings-card">'+
      '<h3>📋 Dados Cadastrais</h3>'+

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

      '<div><label>Logo (URL da imagem)</label>'+
      '<input type="text" id="coLogo" value="'+(c.logo||'')+'" placeholder="https://exemplo.com/logo.png">'+
      '<div class="settings-hint">Cole o link de uma imagem para usar como logo no cupom.</div>'+
      (c.logo?'<div style="margin-top:8px"><img src="'+c.logo+'" alt="Logo" style="max-height:60px;border-radius:8px;border:1px solid var(--border)"></div>':'')+
      '</div></div>'+

      '<div class="settings-card">'+
      '<h3>👁️ Preview do Cupom</h3>'+
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
    if(v.length<=10)v=v.replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{4})(\d)/,'$1-$2');
    else v=v.replace(/(\d{2})(\d)/,'($1) $2').replace(/(\d{5})(\d)/,'$1-$2');
    el.value=v;
  };

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
      motto:$('coMotto').value.trim()
    };
    saveDB();
    logActivity('EMPRESA_SALVA','Dados da empresa atualizados');
    toast('Dados da empresa salvos com sucesso!','success');
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
    m.innerHTML=
      '<div class="page-header"><h2>⚙️ Configuracoes</h2></div>'+

      '<div class="settings-card">'+
      '<h3>📱 Configuracao PIX</h3>'+
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
      '🔌 <strong>Modo USB (Teclado):</strong> A balanca envia o peso como se fosse digitado no teclado. Posicione o cursor no campo de peso e pese o produto. Se nao tiver balanca USB, digite o peso manualmente.'+
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
      '<h3>ℹ️ Informacoes do Sistema</h3>'+
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">'+
      '<div><strong>Versao:</strong> 2.0</div>'+
      '<div><strong>Produtos:</strong> '+DB.products.length+'</div>'+
      '<div><strong>Clientes:</strong> '+DB.clients.length+'</div>'+
      '<div><strong>Funcionarios:</strong> '+DB.employees.filter(function(e){return e.active}).length+' ativos</div>'+
      '<div><strong>Vendas:</strong> '+DB.sales.length+'</div>'+
      '<div><strong>Banho & Tosa:</strong> '+DB.bathGrooming.length+'</div>'+
      '</div></div>';
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
    btn.textContent='⏳ Testando...';
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
  window.showPixQRCode=function(saleId){
    var sale=DB.sales.find(function(s){return s.id===saleId});
    if(!sale)return;
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
      '<button class="btn btn-blue" onclick="copyPixKey(document.querySelector(\'.qr-pix-key\'))">📋 Copiar Chave</button>'+
      '<button class="btn btn-primary" onclick="printPixQR()">🖨️ Imprimir</button>';
    openModal('Comprovante PIX — Venda #'+sale.id,html,foot,'qr-modal');
  };
  window.copyPixKey=function(el){
    var text=el.textContent.replace('CLIQUE PARA COPIAR','').trim();
    if(navigator.clipboard){navigator.clipboard.writeText(text).then(function(){toast('Chave PIX copiada!','success')})}
    else{var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);toast('Chave PIX copiada!','success')}
  };
  window.printPixQR=function(){
    var img=document.querySelector('.qr-wrap img');
    var amount=document.querySelector('.qr-amount');
    var pixKey=document.querySelector('.qr-pix-key');
    if(!img)return;
    var win=window.open('','','width=400,height=600');
    win.document.write('<html><head><title>PIX</title><style>'+
      'body{margin:0;padding:20px;font-family:Inter,Arial,sans-serif;text-align:center;background:#fff}'+
      'h2{font-size:16px;color:#333;margin:0 0 4px 0}'+
      'p{font-size:11px;color:#666;margin:0 0 16px 0}'+
      'img{border:6px solid #eee;border-radius:10px}'+
      '.amount{font-size:24px;font-weight:900;color:#a855f7;margin:12px 0}'+
      '.key{background:#f0f0f0;border:2px dashed #a855f7;border-radius:8px;padding:10px;margin:12px 0;word-break:break-all;font-family:Courier New,monospace;font-size:10px;color:#333}'+
      '.info{font-size:10px;color:#666;margin-top:8px}'+
      '</style></head><body>'+
      '<h2>🏦 PIX — '+(getCompanyData()?(getCompanyData().fantasyName||getCompanyData().name||'Empresa'):'Empresa')+'</h2>'+
      '<p>Escaneie o QR Code ou copie a chave abaixo</p>'+
      '<img src="'+img.src+'" width="220" height="220"><br>'+
      '<div class="amount">'+(amount?amount.textContent:'')+'</div>'+
      '<div class="key">'+(pixKey?pixKey.textContent.replace('CLIQUE PARA COPIAR','').trim():'')+'</div>'+
      '<div class="info">Venda #'+(DB.sales.length>0?DB.sales[DB.sales.length-1].id:'')+' | '+formatDate(new Date())+'</div>'+
      '</body></html>');
    win.document.close();win.focus();win.print();win.close();
  };

  // ===== 5. EXPORT REPORT TXT =====
  window.exportReportTXT=function(){
    var activeSales=DB.sales.filter(function(s){return s.status!=='cancelado'});
    var totalRevenue=activeSales.reduce(function(s,v){return s+v.total},0);
    var totalExpenses=(DB.expenses||[]).reduce(function(s,e){return s+e.amount},0);
    var totalProfit=totalRevenue-totalExpenses;
    var avgTicket=activeSales.length>0?totalRevenue/activeSales.length:0;
    var paymentCounts={dinheiro:0,cartao:0,pix:0,debito:0};
    activeSales.forEach(function(s){paymentCounts[s.payment]=(paymentCounts[s.payment]||0)+1});
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
      {id:'dashboard',icon:'📊',label:'Dashboard'},
      {id:'pdv',icon:'🛒',label:'PDV / Caixa'},
      {id:'calculator',icon:'🧮',label:'Calculadora'},
      {id:'products',icon:'📦',label:'Produtos'},
      {id:'stock',icon:'📋',label:'Estoque'},
      {id:'expiryreport',icon:'📅',label:'Validade'},
      {id:'employees',icon:'👥',label:'Funcionarios'},
      {id:'users',icon:'👤',label:'Usuarios'},
      {id:'categories',icon:'🏷️',label:'Categorias'},
      {id:'pricetags',icon:'🏷️',label:'Etiquetas'},
      {id:'clients',icon:'🧑',label:'Clientes'},
      {id:'bathgrooming',icon:'🛁',label:'Banho & Tosa'},
      {id:'services',icon:'🛎️',label:'Servicos'},
      {id:'packages',icon:'🎫',label:'Pacotes'},
      {id:'sales',icon:'💰',label:'Vendas'},
      {id:'expenses',icon:'💸',label:'Despesas'},
      {id:'reports',icon:'📈',label:'Relatorios'},
      {id:'company',icon:'🏢',label:'Empresa'},
      {id:'activitylog',icon:'📝',label:'Log de Atividades'},
      {id:'dbconfig',icon:'🗄️',label:'Banco de Dados'},
      {id:'backup',icon:'🔄',label:'Backup / Restore'},
      {id:'settings',icon:'⚙️',label:'Configuracoes'},
      {id:'permissions',icon:'🔐',label:'Permissoes'},
      {id:'bulkpriceincrease',icon:'📈',label:'Aumentar Preco (%)'}
    ];
    var types=[
      {id:'admin',label:'Administrador',color:'#ff4757',icon:'👑'},
      {id:'func',label:'Funcionario',color:'#6e9bff',icon:'👨‍💼'},
      {id:'cliente',label:'Cliente',color:'#2ed573',icon:'🧑'}
    ];
    var html=
      '<div class="page-header"><h2>🔐 Permissoes de Acesso</h2>'+
      '<div class="header-actions"><button class="btn btn-primary" onclick="savePermissions()">💾 Salvar Permissoes</button></div></div>'+
      '<p style="color:var(--txt2);margin-bottom:20px;font-size:14px">Configure quais paginas cada tipo de usuario pode acessar. Apenas administradores podem alterar estas configuracoes.</p>';
    types.forEach(function(t){
      html+='<div class="settings-card" style="margin-bottom:20px;border-left:4px solid '+t.color+'">'+
        '<h3>'+t.icon+' '+t.label+'</h3>'+
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px">';
      allPages.forEach(function(p){
        var checked=perm[t.id]&&perm[t.id][p.id];
        html+='<label class="perm-toggle" style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--bg3);border-radius:var(--r);cursor:pointer;font-size:13px;'+(checked?'border:1px solid '+t.color+'30':'border:1px solid transparent')+'">'+
          '<input type="checkbox" class="perm-cb" data-type="'+t.id+'" data-page="'+p.id+'"'+(checked?' checked':'')+' style="accent-color:'+t.color+'">'+
          '<span>'+p.icon+' '+p.label+'</span></label>';
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

})();
