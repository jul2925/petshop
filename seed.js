require('dotenv').config();
const mongo = require('./mongo');

const DEFAULT_DB = {
  products: [
    { id: 1, name: 'Racao Premium Cao Adulto 15kg', cat: 'Alimentacao', price: 189.90, stock: 40, minStock: 8, unit: 'kg', barcode: '7891000001001', emoji: '🐕' },
    { id: 2, name: 'Racao Premium Gato Adulto 10kg', cat: 'Alimentacao', price: 159.90, stock: 35, minStock: 8, unit: 'kg', barcode: '7891000001002', emoji: '🐱' },
    { id: 3, name: 'Racao Filhote Cao 8kg', cat: 'Alimentacao', price: 129.90, stock: 30, minStock: 6, unit: 'kg', barcode: '7891000001003', emoji: '🐶' },
    { id: 4, name: 'Racao Filhote Gato 5kg', cat: 'Alimentacao', price: 99.90, stock: 25, minStock: 6, unit: 'kg', barcode: '7891000001004', emoji: '🐈' },
    { id: 5, name: 'Racao Castrados Gato 5kg', cat: 'Alimentacao', price: 109.90, stock: 30, minStock: 6, unit: 'kg', barcode: '7891000001005', emoji: '🐱' },
    { id: 6, name: 'Racao Senior Cao 12kg', cat: 'Alimentacao', price: 169.90, stock: 20, minStock: 5, unit: 'kg', barcode: '7891000001006', emoji: '🐕' },
    { id: 7, name: 'Petisco Dental Cao 150g', cat: 'Alimentacao', price: 24.90, stock: 60, minStock: 10, unit: 'g', barcode: '7891000001007', emoji: '🦴' },
    { id: 8, name: 'Petisco Gato Tubo 20g x6', cat: 'Alimentacao', price: 18.90, stock: 80, minStock: 12, unit: 'un', barcode: '7891000001008', emoji: '🐟' },
    { id: 9, name: 'Ossinho Defumado 120g', cat: 'Alimentacao', price: 19.90, stock: 50, minStock: 10, unit: 'g', barcode: '7891000001009', emoji: '🦴' },
    { id: 10, name: 'Sache Frango Gato 85g', cat: 'Alimentacao', price: 5.90, stock: 200, minStock: 30, unit: 'g', barcode: '7891000001010', emoji: '🍗' },
    { id: 11, name: 'Sache Carne Gato 85g', cat: 'Alimentacao', price: 5.90, stock: 180, minStock: 30, unit: 'g', barcode: '7891000001011', emoji: '🥩' },
    { id: 12, name: 'Shampoo Neutro Cao 500ml', cat: 'Higiene', price: 32.90, stock: 40, minStock: 8, unit: 'ml', barcode: '7891000001012', emoji: '🧴' },
    { id: 13, name: 'Shampoo Antipulga 500ml', cat: 'Higiene', price: 39.90, stock: 35, minStock: 8, unit: 'ml', barcode: '7891000001013', emoji: '🧴' },
    { id: 14, name: 'Condicionador Pet 500ml', cat: 'Higiene', price: 34.90, stock: 30, minStock: 6, unit: 'ml', barcode: '7891000001014', emoji: '🧴' },
    { id: 15, name: 'Areia Sanitaria Silica 5kg', cat: 'Higiene', price: 29.90, stock: 80, minStock: 15, unit: 'kg', barcode: '7891000001015', emoji: '🧱' },
    { id: 16, name: 'Areia Sanitaria Bentonita 10kg', cat: 'Higiene', price: 24.90, stock: 60, minStock: 12, unit: 'kg', barcode: '7891000001016', emoji: '🧱' },
    { id: 17, name: 'Lencol Higienico Pet 30un', cat: 'Higiene', price: 22.90, stock: 50, minStock: 10, unit: 'un', barcode: '7891000001017', emoji: '🧻' },
    { id: 18, name: 'Perfume Pet Spray 120ml', cat: 'Higiene', price: 28.90, stock: 45, minStock: 8, unit: 'ml', barcode: '7891000001018', emoji: '🌸' },
    { id: 19, name: 'Colonia Pet 150ml', cat: 'Higiene', price: 25.90, stock: 40, minStock: 8, unit: 'ml', barcode: '7891000001019', emoji: '💐' },
    { id: 20, name: 'Ovos de Cama Peludo', cat: 'Higiene', price: 19.90, stock: 100, minStock: 15, unit: 'un', barcode: '7891000001020', emoji: '🥚' },
    { id: 21, name: 'Coleira Couro Pequena', cat: 'Acessorios', price: 49.90, stock: 25, minStock: 5, unit: 'un', barcode: '7891000001021', emoji: '📿' },
    { id: 22, name: 'Coleira Couro Media', cat: 'Acessorios', price: 59.90, stock: 25, minStock: 5, unit: 'un', barcode: '7891000001022', emoji: '📿' },
    { id: 23, name: 'Coleira Couro Grande', cat: 'Acessorios', price: 69.90, stock: 20, minStock: 5, unit: 'un', barcode: '7891000001023', emoji: '📿' },
    { id: 24, name: 'Guia de Passeio Retractil', cat: 'Acessorios', price: 44.90, stock: 30, minStock: 6, unit: 'un', barcode: '7891000001024', emoji: '🔗' },
    { id: 25, name: 'Peitoral Gato Escapulario', cat: 'Acessorios', price: 39.90, stock: 20, minStock: 5, unit: 'un', barcode: '7891000001025', emoji: '🐱' },
    { id: 26, name: 'Bolinha de Silicone', cat: 'Brinquedos', price: 14.90, stock: 100, minStock: 15, unit: 'un', emoji: '⚽' },
    { id: 27, name: 'Ratinho de Pelucia x3', cat: 'Brinquedos', price: 22.90, stock: 60, minStock: 10, unit: 'un', emoji: '🐭' },
    { id: 28, name: 'Corda Trancada Cao', cat: 'Brinquedos', price: 29.90, stock: 45, minStock: 8, unit: 'un', emoji: '🪢' },
    { id: 29, name: 'Varinha com Pena', cat: 'Brinquedos', price: 19.90, stock: 50, minStock: 8, unit: 'un', emoji: '🪶' },
    { id: 30, name: 'Bexia de Nylon Cao', cat: 'Brinquedos', price: 12.90, stock: 80, minStock: 12, unit: 'un', emoji: '🎈' },
    { id: 31, name: 'Casinha Cao Medio', cat: 'Casas e Camas', price: 189.90, stock: 15, minStock: 3, unit: 'un', emoji: '🏠' },
    { id: 32, name: 'Casinha Gato com Descanco', cat: 'Casas e Camas', price: 159.90, stock: 12, minStock: 3, unit: 'un', emoji: '🏠' },
    { id: 33, name: 'Cama Peluda Oval P', cat: 'Casas e Camas', price: 89.90, stock: 20, minStock: 5, unit: 'un', emoji: '🛏️' },
    { id: 34, name: 'Cama Peluda Oval M', cat: 'Casas e Camas', price: 119.90, stock: 15, minStock: 4, unit: 'un', emoji: '🛏️' },
    { id: 35, name: 'Cama Peluda Oval G', cat: 'Casas e Camas', price: 149.90, stock: 10, minStock: 3, unit: 'un', emoji: '🛏️' },
    { id: 36, name: 'Caixa de Transporte P', cat: 'Transporte', price: 79.90, stock: 20, minStock: 5, unit: 'un', emoji: '📦' },
    { id: 37, name: 'Caixa de Transporte M', cat: 'Transporte', price: 99.90, stock: 15, minStock: 4, unit: 'un', emoji: '📦' },
    { id: 38, name: 'Caixa de Transporte G', cat: 'Transporte', price: 129.90, stock: 10, minStock: 3, unit: 'un', emoji: '📦' },
    { id: 39, name: 'Bolsa de Transporte Gato', cat: 'Transporte', price: 89.90, stock: 18, minStock: 4, unit: 'un', emoji: '👜' },
    { id: 40, name: 'Comedouro Inox P', cat: 'Acessorios', price: 29.90, stock: 40, minStock: 8, unit: 'un', emoji: '🥣' },
    { id: 41, name: 'Comedouro Inox M', cat: 'Acessorios', price: 34.90, stock: 35, minStock: 8, unit: 'un', emoji: '🥣' },
    { id: 42, name: 'Comedouro Inox G', cat: 'Acessorios', price: 44.90, stock: 25, minStock: 6, unit: 'un', emoji: '🥣' },
    { id: 43, name: 'Bebedouro Automatico 2L', cat: 'Acessorios', price: 79.90, stock: 20, minStock: 5, unit: 'un', emoji: '💧' },
    { id: 44, name: 'Pote Duplo Viagem', cat: 'Acessorios', price: 34.90, stock: 30, minStock: 6, unit: 'un', emoji: '🍽️' },
    { id: 45, name: 'Adestrador Eletronico', cat: 'Acessorios', price: 69.90, stock: 15, minStock: 3, unit: 'un', emoji: '⚡' },
    { id: 46, name: 'Antipulga Cao P 4un', cat: 'Saude', price: 59.90, stock: 40, minStock: 8, unit: 'un', emoji: '💊' },
    { id: 47, name: 'Antipulga Cao G 4un', cat: 'Saude', price: 79.90, stock: 30, minStock: 6, unit: 'un', emoji: '💊' },
    { id: 48, name: 'Antipulga Gato 3un', cat: 'Saude', price: 54.90, stock: 35, minStock: 8, unit: 'un', emoji: '💊' },
    { id: 49, name: 'Vermifugo Cao 2un', cat: 'Saude', price: 39.90, stock: 50, minStock: 10, unit: 'un', emoji: '💊' },
    { id: 50, name: 'Vermifugo Gato 2un', cat: 'Saude', price: 34.90, stock: 45, minStock: 10, unit: 'un', emoji: '💊' },
    { id: 51, name: 'Vacina V10 Cao', cat: 'Saude', price: 89.90, stock: 20, minStock: 5, unit: 'un', emoji: '💉' },
    { id: 52, name: 'Vacina V4 Gato', cat: 'Saude', price: 79.90, stock: 20, minStock: 5, unit: 'un', emoji: '💉' },
    { id: 53, name: 'Vitamina Pet 250ml', cat: 'Saude', price: 44.90, stock: 30, minStock: 6, unit: 'ml', emoji: '🧪' },
    { id: 54, name: 'Shampoo Seco Cao 200ml', cat: 'Higiene', price: 36.90, stock: 25, minStock: 5, unit: 'ml', emoji: '🧴' },
    { id: 55, name: 'Pasta de Dentes Pet 100g', cat: 'Higiene', price: 29.90, stock: 30, minStock: 6, unit: 'g', emoji: '🪥' },
    { id: 56, name: 'Escova de Dentes Pet', cat: 'Higiene', price: 14.90, stock: 50, minStock: 10, unit: 'un', emoji: '🪥' },
    { id: 57, name: 'Alicate de Unha Pet', cat: 'Higiene', price: 24.90, stock: 35, minStock: 8, unit: 'un', emoji: '✂️' },
    { id: 58, name: 'Pente Antipulga', cat: 'Higiene', price: 18.90, stock: 40, minStock: 8, unit: 'un', emoji: '🪮' },
    { id: 59, name: 'Fita Antiparasitaria Cao', cat: 'Saude', price: 34.90, stock: 40, minStock: 8, unit: 'un', emoji: '🔖' },
    { id: 60, name: 'Fita Antiparasitaria Gato', cat: 'Saude', price: 32.90, stock: 35, minStock: 8, unit: 'un', emoji: '🔖' },
    { id: 61, name: 'Roupa Pet Estampada P', cat: 'Roupas', price: 39.90, stock: 20, minStock: 5, unit: 'un', emoji: '👗' },
    { id: 62, name: 'Roupa Pet Estampada M', cat: 'Roupas', price: 49.90, stock: 20, minStock: 5, unit: 'un', emoji: '👗' },
    { id: 63, name: 'Roupa Pet Estampada G', cat: 'Roupas', price: 59.90, stock: 15, minStock: 4, unit: 'un', emoji: '👗' },
    { id: 64, name: 'Coleira Guia Combo', cat: 'Acessorios', price: 69.90, stock: 25, minStock: 5, unit: 'un', emoji: '✨' },
    { id: 65, name: 'Caminha Paninha Quente', cat: 'Casas e Camas', price: 59.90, stock: 20, minStock: 5, unit: 'un', emoji: '🛏️' },
    { id: 66, name: 'Capa de Chuva Pet P', cat: 'Acessorios', price: 34.90, stock: 15, minStock: 3, unit: 'un', emoji: '☔' },
    { id: 67, name: 'Capa de Chuva Pet M', cat: 'Acessorios', price: 39.90, stock: 15, minStock: 3, unit: 'un', emoji: '☔' },
    { id: 68, name: 'Petisco Premium Filhote', cat: 'Alimentacao', price: 16.90, stock: 50, minStock: 8, unit: 'g', emoji: '🐾' },
    { id: 69, name: 'Snack Cao Bacon 100g', cat: 'Alimentacao', price: 14.90, stock: 60, minStock: 10, unit: 'g', emoji: '🥓' },
    { id: 70, name: 'Ossinho de Couro Natural', cat: 'Alimentacao', price: 22.90, stock: 45, minStock: 8, unit: 'un', emoji: '🦴' },
    { id: 71, name: 'Brinquedo Quebra Cabeca', cat: 'Brinquedos', price: 44.90, stock: 20, minStock: 5, unit: 'un', emoji: '🧩' },
    { id: 72, name: 'Tunel Gato Dobradica', cat: 'Brinquedos', price: 79.90, stock: 12, minStock: 3, unit: 'un', emoji: '🚇' },
    { id: 73, name: 'Escada Gato Parede', cat: 'Casas e Camas', price: 129.90, stock: 8, minStock: 2, unit: 'un', emoji: '🪜' },
    { id: 74, name: 'Cercado Gato Telado', cat: 'Casas e Camas', price: 149.90, stock: 6, minStock: 2, unit: 'un', emoji: '🏗️' },
    { id: 75, name: 'GPS Pet Tracker', cat: 'Saude', price: 149.90, stock: 10, minStock: 3, unit: 'un', emoji: '📍' },
    { id: 76, name: 'Cama Gel Refrescante P', cat: 'Casas e Camas', price: 99.90, stock: 12, minStock: 3, unit: 'un', emoji: '❄️' },
    { id: 77, name: 'Cama Gel Refrescante M', cat: 'Casas e Camas', price: 129.90, stock: 10, minStock: 3, unit: 'un', emoji: '❄️' },
    { id: 78, name: 'Cama Gel Refrescante G', cat: 'Casas e Camas', price: 159.90, stock: 8, minStock: 2, unit: 'un', emoji: '❄️' },
    { id: 79, name: 'Corta Unha Profissional', cat: 'Higiene', price: 32.90, stock: 25, minStock: 5, unit: 'un', emoji: '✂️' },
    { id: 80, name: 'Placa Identificacao Pet', cat: 'Acessorios', price: 24.90, stock: 40, minStock: 8, unit: 'un', emoji: '🪪' },
    { id: 81, name: 'Cobertor Pelucia Pequeno', cat: 'Casas e Camas', price: 49.90, stock: 20, minStock: 5, unit: 'un', emoji: '🧣' },
    { id: 82, name: 'Cobertor Pelucia Medio', cat: 'Casas e Camas', price: 69.90, stock: 15, minStock: 4, unit: 'un', emoji: '🧣' },
    { id: 83, name: 'Mochila Pet Viagem', cat: 'Transporte', price: 149.90, stock: 10, minStock: 3, unit: 'un', emoji: '🎒' },
    { id: 84, name: 'Asinha de Passeio Gato', cat: 'Acessorios', price: 54.90, stock: 15, minStock: 4, unit: 'un', emoji: '🪽' },
    { id: 85, name: 'Spray Calmante Pet 200ml', cat: 'Saude', price: 49.90, stock: 25, minStock: 5, unit: 'ml', emoji: '🌿' },
    { id: 86, name: 'Oleo de Salmao 250ml', cat: 'Saude', price: 54.90, stock: 20, minStock: 5, unit: 'ml', emoji: '🐟' },
    { id: 87, name: 'Probiotico Pet 30 caps', cat: 'Saude', price: 69.90, stock: 18, minStock: 4, unit: 'un', emoji: '💊' },
    { id: 88, name: 'Pasta Osso Dentiro 100g', cat: 'Saude', price: 27.90, stock: 30, minStock: 6, unit: 'g', emoji: '🦴' },
    { id: 89, name: 'Tapete Higienico P', cat: 'Higiene', price: 39.90, stock: 30, minStock: 6, unit: 'un', emoji: '🧱' },
    { id: 90, name: 'Tapete Higienico G', cat: 'Higiene', price: 59.90, stock: 20, minStock: 5, unit: 'un', emoji: '🧱' },
    { id: 91, name: 'Fraldas Pet G', cat: 'Higiene', price: 44.90, stock: 25, minStock: 5, unit: 'un', emoji: '👶' },
    { id: 92, name: 'Cama Ortopedica Cao Grande', cat: 'Casas e Camas', price: 249.90, stock: 8, minStock: 2, unit: 'un', emoji: '🛏️' },
    { id: 93, name: 'Bebedouro Filtrante 3L', cat: 'Acessorios', price: 89.90, stock: 15, minStock: 4, unit: 'un', emoji: '💧' },
    { id: 94, name: 'Alimentador Automatico 5kg', cat: 'Acessorios', price: 179.90, stock: 10, minStock: 3, unit: 'un', emoji: '🍽️' },
    { id: 95, name: 'Canivete Emergencia Pet', cat: 'Saude', price: 29.90, stock: 20, minStock: 5, unit: 'un', emoji: '🔧' }
  ],
  employees: [
    { id: 1, name: 'Carlos Silva', role: 'Caixa', shift: 'Manha', salary: 2200, active: true, phone: '(11)99999-1111' },
    { id: 2, name: 'Maria Santos', role: 'Estoque', shift: 'Tarde', salary: 2400, active: true, phone: '(11)99999-2222' },
    { id: 3, name: 'Joao Oliveira', role: 'Gerente', shift: 'Manha', salary: 4500, active: true, phone: '(11)99999-3333' },
    { id: 4, name: 'Ana Costa', role: 'Caixa', shift: 'Noite', salary: 2200, active: true, phone: '(11)99999-4444' },
    { id: 5, name: 'Pedro Souza', role: 'Repositor', shift: 'Manha', salary: 2000, active: false, phone: '(11)99999-5555' }
  ],
  users: [
    { id: 1, username: 'admin', password: 'admin123', name: 'Administrador Geral', type: 'admin', active: true },
    { id: 2, username: 'func', password: 'func123', name: 'Funcionario Teste', type: 'func', active: true },
    { id: 3, username: 'cliente', password: 'cli123', name: 'Cliente Teste', type: 'cliente', active: true }
  ],
  clients: [
    { id: 1, name: 'Joao Pereira', phone: '(11)98888-1001', cpf: '123.456.789-00', email: 'joao@email.com', address: 'Rua das Flores, 100 - SP', active: true, dogs: [] },
    { id: 2, name: 'Ana Beatriz', phone: '(11)98888-1002', cpf: '987.654.321-00', email: 'ana@email.com', address: 'Av. Brasil, 200 - SP', active: true, dogs: [{ name: 'Rex', breed: 'Labrador', age: 3, color: 'Dourado' }, { name: 'Luna', breed: 'Poodle', age: 2, color: 'Branco' }] },
    { id: 3, name: 'Carlos Mendes', phone: '(11)98888-1003', cpf: '456.789.123-00', email: 'carlos@email.com', address: 'Rua Augusta, 300 - SP', active: true, dogs: [{ name: 'Thor', breed: 'Bulldog', age: 4, color: 'Marrom' }] }
  ],
  bathGrooming: [
    { id: 1, clientId: 2, dogName: 'Rex', service: 'Banho e Tosa Completa', date: new Date(Date.now() - 86400000 * 2).toISOString(), price: 120, status: 'Concluido', notes: 'Cachorro calmo', professional: 'Maria Santos' },
    { id: 2, clientId: 2, dogName: 'Luna', service: 'Banho Simples', date: new Date(Date.now() - 86400000).toISOString(), price: 60, status: 'Concluido', notes: 'Usar shampoo hipoalergenico', professional: 'Ana Costa' },
    { id: 3, clientId: 3, dogName: 'Thor', service: 'Banho e Tosa Completa', date: new Date(Date.now() + 86400000).toISOString(), price: 130, status: 'Agendado', notes: 'Cuidado com rolinho do focinho', professional: 'Maria Santos' }
  ],
  services: [
    { id: 1, name: 'Banho Simples', price: 60, duration: 60, description: 'Banho com shampoo neutro, secagem e penteado basico', active: true },
    { id: 2, name: 'Banho e Tosa Completa', price: 120, duration: 120, description: 'Banho, tosa higienica, corte de unhas e limpeza de ouvidos', active: true },
    { id: 3, name: 'Tosa Higienica', price: 70, duration: 60, description: 'Tosa na regiao genital, patas e visao', active: true },
    { id: 4, name: 'Tosa Completa', price: 90, duration: 90, description: 'Tosa em todo o corpo conforme padrao da raca', active: true },
    { id: 5, name: 'Corte de Unhas', price: 25, duration: 20, description: 'Corte e lixamento de unhas', active: true },
    { id: 6, name: 'Limpeza de Ouvidos', price: 20, duration: 15, description: 'Limpeza e higienizacao dos ouvidos', active: true },
    { id: 7, name: 'Lavagem Profunda', price: 80, duration: 75, description: 'Lavagem com produtos especiais para pele sensivel', active: true },
    { id: 8, name: 'Pacote VIP (Banho+Tosa+Unhas+Ouvidos)', price: 160, duration: 150, description: 'Servico completo: banho, tosa, unhas e ouvidos', active: true }
  ],
  clientPackages: [],
  waitingList: [],
  sales: [],
  expenses: [],
  activityLog: [],
  nextProductId: 96,
  nextEmployeeId: 6,
  nextUserId: 4,
  nextSaleId: 1,
  nextClientId: 4,
  nextBathId: 4,
  nextServiceId: 9,
  nextPackageId: 1,
  nextExpenseId: 1,
  settings: {
    pixKey: '',
    pixName: 'PetShop Prado',
    pixCity: 'Sao Paulo',
    scale: {
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none',
      protocol: 'toledo',
      unitDefault: 'kg',
      stableTimeout: 2000,
      decimals: 3
    },
    company: {
      name: '',
      fantasyName: '',
      cnpj: '',
      cpf: '',
      ie: '',
      im: '',
      address: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zip: '',
      phone: '',
      phone2: '',
      email: '',
      website: '',
      activity: '',
      logo: '',
      motto: ''
    }
  }
};

async function seed() {
  const isReset = process.argv.includes('--reset');

  try {
    await mongo.connect();
    const col = mongo.getDb().collection('appdata');

    const existing = await col.findOne({ _id: 'main' });

    if (existing && !isReset) {
      console.log('[SEED] Dados ja existem no MongoDB.');
      console.log('[SEED] Use "npm run seed:reset" para recriar com dados padrao.');
      await mongo.close();
      return;
    }

    if (isReset) {
      console.log('[SEED] Resetando dados...');
      await col.deleteOne({ _id: 'main' });
    }

    const doc = { _id: 'main', ...DEFAULT_DB };
    await col.insertOne(doc);

    console.log('[SEED] Dados iniciais inseridos com sucesso!');
    console.log(`[SEED] Produtos: ${DEFAULT_DB.products.length}`);
    console.log(`[SEED] Funcionarios: ${DEFAULT_DB.employees.length}`);
    console.log(`[SEED] Usuarios: ${DEFAULT_DB.users.length}`);
    console.log(`[SEED] Clientes: ${DEFAULT_DB.clients.length}`);
    console.log(`[SEED] Servicos: ${DEFAULT_DB.services.length}`);

    await mongo.close();
  } catch (err) {
    console.error('[SEED] Erro:', err.message);
    process.exit(1);
  }
}

seed();
