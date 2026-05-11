import { PrismaClient, TipoTrabalho, SituacaoTrabalho, StatusEquipamento, PerfilAcesso } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Tipos de Equipamento
  const tiposEquip = await Promise.all([
    prisma.tipoEquipamento.upsert({ where: { nome: 'Notebook' }, update: {}, create: { nome: 'Notebook', icone: 'laptop' } }),
    prisma.tipoEquipamento.upsert({ where: { nome: 'Desktop' }, update: {}, create: { nome: 'Desktop', icone: 'monitor' } }),
    prisma.tipoEquipamento.upsert({ where: { nome: 'Servidor' }, update: {}, create: { nome: 'Servidor', icone: 'server' } }),
    prisma.tipoEquipamento.upsert({ where: { nome: 'Monitor' }, update: {}, create: { nome: 'Monitor', icone: 'monitor' } }),
    prisma.tipoEquipamento.upsert({ where: { nome: 'Mouse' }, update: {}, create: { nome: 'Mouse', icone: 'mouse-pointer' } }),
    prisma.tipoEquipamento.upsert({ where: { nome: 'Teclado' }, update: {}, create: { nome: 'Teclado', icone: 'keyboard' } }),
    prisma.tipoEquipamento.upsert({ where: { nome: 'Coletor' }, update: {}, create: { nome: 'Coletor', icone: 'scan' } }),
  ])
  console.log('✅ Tipos de equipamento criados')

  // Marcas
  const marcas = await Promise.all([
    prisma.marca.upsert({ where: { nome: 'Dell' }, update: {}, create: { nome: 'Dell' } }),
    prisma.marca.upsert({ where: { nome: 'Lenovo' }, update: {}, create: { nome: 'Lenovo' } }),
    prisma.marca.upsert({ where: { nome: 'HP' }, update: {}, create: { nome: 'HP' } }),
    prisma.marca.upsert({ where: { nome: 'Apple' }, update: {}, create: { nome: 'Apple' } }),
    prisma.marca.upsert({ where: { nome: 'Samsung' }, update: {}, create: { nome: 'Samsung' } }),
    prisma.marca.upsert({ where: { nome: 'Datalogic' }, update: {}, create: { nome: 'Datalogic' } }),
  ])
  console.log('✅ Marcas criadas')

  // Tipos de Posse
  const tiposPosse = await Promise.all([
    prisma.tipoPosse.upsert({ where: { categoria: 'Próprio' }, update: {}, create: { categoria: 'Próprio' } }),
    prisma.tipoPosse.upsert({ where: { categoria: 'Alugado' }, update: {}, create: { categoria: 'Alugado' } }),
    prisma.tipoPosse.upsert({ where: { categoria: 'Particular' }, update: {}, create: { categoria: 'Particular' } }),
  ])
  console.log('✅ Tipos de posse criados')

  // Tipos de Licença
  await Promise.all([
    prisma.tipoLicenca.upsert({ where: { nome: 'Microsoft 365 Business Standard' }, update: {}, create: { nome: 'Microsoft 365 Business Standard', tipo: 'Office', descricao: 'Suite Office completa + Teams', custo: 57.00 } }),
    prisma.tipoLicenca.upsert({ where: { nome: 'Exchange Online Plan 1' }, update: {}, create: { nome: 'Exchange Online Plan 1', tipo: 'Email', descricao: 'Email corporativo 50GB', custo: 17.00 } }),
    prisma.tipoLicenca.upsert({ where: { nome: 'Power BI Pro' }, update: {}, create: { nome: 'Power BI Pro', tipo: 'Analytics', descricao: 'Business Intelligence', custo: 57.00 } }),
    prisma.tipoLicenca.upsert({ where: { nome: 'Microsoft Fabric' }, update: {}, create: { nome: 'Microsoft Fabric', tipo: 'Analytics', descricao: 'Data platform unificada', custo: 115.00 } }),
    prisma.tipoLicenca.upsert({ where: { nome: 'Microsoft Project Plan 3' }, update: {}, create: { nome: 'Microsoft Project Plan 3', tipo: 'Gestão', descricao: 'Gerenciamento de projetos', custo: 57.00 } }),
  ])
  console.log('✅ Tipos de licença criados')

  // Empresas do Grupo Cassol
  const empresas = await Promise.all([
    prisma.empresa.upsert({ where: { id: 1 }, update: {}, create: { id: 1, nome: 'Cassol Materiais de Construção', cnpj: '00.000.001/0001-00' } }),
    prisma.empresa.upsert({ where: { id: 2 }, update: {}, create: { id: 2, nome: 'Cassol Pré-Fabricados', cnpj: '00.000.002/0001-00' } }),
    prisma.empresa.upsert({ where: { id: 3 }, update: {}, create: { id: 3, nome: 'Cassol Logística', cnpj: '00.000.003/0001-00' } }),
    prisma.empresa.upsert({ where: { id: 4 }, update: {}, create: { id: 4, nome: 'Cassol Real Estate', cnpj: '00.000.004/0001-00' } }),
    prisma.empresa.upsert({ where: { id: 5 }, update: {}, create: { id: 5, nome: 'Cassol Florestal', cnpj: '00.000.005/0001-00' } }),
    prisma.empresa.upsert({ where: { id: 6 }, update: {}, create: { id: 6, nome: 'Cassol Administradora de Cartões', cnpj: '00.000.006/0001-00' } }),
  ])
  console.log('✅ Empresas criadas')

  // Unidades
  const unidades = await Promise.all([
    prisma.unidade.upsert({ where: { id: 1 }, update: {}, create: { id: 1, nome: 'Matriz - Florianópolis', uf: 'SC', empresaId: 1 } }),
    prisma.unidade.upsert({ where: { id: 2 }, update: {}, create: { id: 2, nome: 'Filial Joinville', uf: 'SC', empresaId: 1 } }),
    prisma.unidade.upsert({ where: { id: 3 }, update: {}, create: { id: 3, nome: 'Sede Pré-Fabricados', uf: 'SC', empresaId: 2 } }),
    prisma.unidade.upsert({ where: { id: 4 }, update: {}, create: { id: 4, nome: 'Centro Logístico Palhoça', uf: 'SC', empresaId: 3 } }),
    prisma.unidade.upsert({ where: { id: 5 }, update: {}, create: { id: 5, nome: 'Escritório Real Estate', uf: 'SC', empresaId: 4 } }),
  ])
  console.log('✅ Unidades criadas')

  // Contrato de exemplo
  const contrato = await prisma.contrato.upsert({
    where: { numero: 'CTR-2024-001' },
    update: {},
    create: {
      numero: 'CTR-2024-001',
      fornecedor: 'Dell Financial Services',
      dataContrato: new Date('2024-01-15'),
      dataFinal: new Date('2026-01-15'),
      valor: 125000.00,
      observacoes: 'Contrato de locação de notebooks Dell Latitude',
    }
  })
  console.log('✅ Contrato criado')

  // Colaboradores
  const colaboradores = await Promise.all([
    prisma.colaborador.upsert({
      where: { id: '111.111.111-11' },
      update: {},
      create: {
        id: '111.111.111-11', matricula: '001001', nome: 'Ana Paula Ferreira',
        cargo: 'Analista de TI', setor: 'Tecnologia da Informação',
        unidadeId: 1, tipoTrabalho: TipoTrabalho.CLT,
        situacao: SituacaoTrabalho.Trabalhando,
        dataAdmissao: new Date('2020-03-01'),
        userRede: 'ana.ferreira', email: 'ana.ferreira@cassol.com.br',
      }
    }),
    prisma.colaborador.upsert({
      where: { id: '222.222.222-22' },
      update: {},
      create: {
        id: '222.222.222-22', matricula: '001002', nome: 'Carlos Eduardo Santos',
        cargo: 'Gerente de TI', setor: 'Tecnologia da Informação',
        unidadeId: 1, tipoTrabalho: TipoTrabalho.CLT,
        situacao: SituacaoTrabalho.Trabalhando,
        dataAdmissao: new Date('2018-06-15'),
        userRede: 'carlos.santos', email: 'carlos.santos@cassol.com.br',
      }
    }),
    prisma.colaborador.upsert({
      where: { id: '333.333.333-33' },
      update: {},
      create: {
        id: '333.333.333-33', matricula: '002001', nome: 'Mariana Oliveira Costa',
        cargo: 'Analista Financeiro', setor: 'Financeiro',
        unidadeId: 2, tipoTrabalho: TipoTrabalho.CLT,
        situacao: SituacaoTrabalho.Trabalhando,
        dataAdmissao: new Date('2021-09-01'),
        userRede: 'mariana.costa', email: 'mariana.costa@cassol.com.br',
      }
    }),
    prisma.colaborador.upsert({
      where: { id: '444.444.444-44' },
      update: {},
      create: {
        id: '444.444.444-44', matricula: '003001', nome: 'Roberto Lima Pereira',
        cargo: 'Técnico de Suporte', setor: 'Tecnologia da Informação',
        unidadeId: 3, tipoTrabalho: TipoTrabalho.Terceiro,
        situacao: SituacaoTrabalho.Trabalhando,
        dataAdmissao: new Date('2022-01-10'),
        userRede: 'roberto.pereira', email: 'roberto.pereira@cassol.com.br',
      }
    }),
    prisma.colaborador.upsert({
      where: { id: '555.555.555-55' },
      update: {},
      create: {
        id: '555.555.555-55', matricula: '001003', nome: 'Fernanda Rodrigues Silva',
        cargo: 'Coordenadora de RH', setor: 'Recursos Humanos',
        unidadeId: 1, tipoTrabalho: TipoTrabalho.CLT,
        situacao: SituacaoTrabalho.Afastado,
        dataAdmissao: new Date('2019-11-20'),
        userRede: 'fernanda.silva', email: 'fernanda.silva@cassol.com.br',
      }
    }),
  ])
  console.log('✅ Colaboradores criados')

  // Equipamentos
  const equipamentos = [
    { nserial: 'NB-DELL-001', tipoEquipId: tiposEquip[0].id, posseId: tiposPosse[1].id, marcaId: marcas[0].id, unidadeId: 1, contratoId: contrato.id, status: StatusEquipamento.Ativo, modelo: 'Latitude 5540', processador: 'Intel Core i7-1365U', ram: '16GB', memoriaDisco: '512GB SSD', patrimonio: 'PAT-001' },
    { nserial: 'NB-DELL-002', tipoEquipId: tiposEquip[0].id, posseId: tiposPosse[1].id, marcaId: marcas[0].id, unidadeId: 1, contratoId: contrato.id, status: StatusEquipamento.Ativo, modelo: 'Latitude 5540', processador: 'Intel Core i7-1365U', ram: '16GB', memoriaDisco: '512GB SSD', patrimonio: 'PAT-002' },
    { nserial: 'NB-LEN-003', tipoEquipId: tiposEquip[0].id, posseId: tiposPosse[0].id, marcaId: marcas[1].id, unidadeId: 2, status: StatusEquipamento.Ativo, modelo: 'ThinkPad E14', processador: 'AMD Ryzen 5 5600U', ram: '8GB', memoriaDisco: '256GB SSD', patrimonio: 'PAT-003' },
    { nserial: 'DT-HP-001', tipoEquipId: tiposEquip[1].id, posseId: tiposPosse[0].id, marcaId: marcas[2].id, unidadeId: 3, status: StatusEquipamento.Ativo, modelo: 'EliteDesk 800 G9', processador: 'Intel Core i5-13500', ram: '16GB', memoriaDisco: '512GB SSD', patrimonio: 'PAT-004' },
    { nserial: 'MN-DELL-001', tipoEquipId: tiposEquip[3].id, posseId: tiposPosse[0].id, marcaId: marcas[0].id, unidadeId: 1, status: StatusEquipamento.Ativo, modelo: 'P2422H', patrimonio: 'PAT-005' },
    { nserial: 'NB-DELL-003', tipoEquipId: tiposEquip[0].id, posseId: tiposPosse[1].id, marcaId: marcas[0].id, unidadeId: 1, contratoId: contrato.id, status: StatusEquipamento.Estoque, modelo: 'Latitude 5540', processador: 'Intel Core i7-1365U', ram: '16GB', memoriaDisco: '512GB SSD', patrimonio: 'PAT-006' },
    { nserial: 'CLT-DAT-001', tipoEquipId: tiposEquip[6].id, posseId: tiposPosse[0].id, marcaId: marcas[5].id, unidadeId: 4, status: StatusEquipamento.Ativo, modelo: 'Memor 20', patrimonio: 'PAT-007' },
    { nserial: 'NB-APL-001', tipoEquipId: tiposEquip[0].id, posseId: tiposPosse[2].id, marcaId: marcas[3].id, unidadeId: 1, status: StatusEquipamento.Ativo, modelo: 'MacBook Pro M3', processador: 'Apple M3 Pro', ram: '18GB', memoriaDisco: '512GB SSD', patrimonio: null },
  ]

  for (const equip of equipamentos) {
    await prisma.equipamento.upsert({
      where: { nserial: equip.nserial },
      update: {},
      create: equip,
    })
  }
  console.log('✅ Equipamentos criados')

  // Vínculos equipamento-usuário
  await Promise.all([
    prisma.equipamentoUsuario.upsert({
      where: { nserial_colaboradorId: { nserial: 'NB-DELL-001', colaboradorId: '111.111.111-11' } },
      update: {},
      create: { nserial: 'NB-DELL-001', colaboradorId: '111.111.111-11', unidadeId: 1, cargo: 'Analista de TI', setor: 'Tecnologia da Informação' }
    }),
    prisma.equipamentoUsuario.upsert({
      where: { nserial_colaboradorId: { nserial: 'NB-DELL-002', colaboradorId: '222.222.222-22' } },
      update: {},
      create: { nserial: 'NB-DELL-002', colaboradorId: '222.222.222-22', unidadeId: 1, cargo: 'Gerente de TI', setor: 'Tecnologia da Informação' }
    }),
    prisma.equipamentoUsuario.upsert({
      where: { nserial_colaboradorId: { nserial: 'NB-LEN-003', colaboradorId: '333.333.333-33' } },
      update: {},
      create: { nserial: 'NB-LEN-003', colaboradorId: '333.333.333-33', unidadeId: 2, cargo: 'Analista Financeiro', setor: 'Financeiro' }
    }),
    prisma.equipamentoUsuario.upsert({
      where: { nserial_colaboradorId: { nserial: 'DT-HP-001', colaboradorId: '444.444.444-44' } },
      update: {},
      create: { nserial: 'DT-HP-001', colaboradorId: '444.444.444-44', unidadeId: 3, cargo: 'Técnico de Suporte', setor: 'Tecnologia da Informação' }
    }),
    prisma.equipamentoUsuario.upsert({
      where: { nserial_colaboradorId: { nserial: 'MN-DELL-001', colaboradorId: '222.222.222-22' } },
      update: {},
      create: { nserial: 'MN-DELL-001', colaboradorId: '222.222.222-22', unidadeId: 1, cargo: 'Gerente de TI', setor: 'Tecnologia da Informação', principal: false }
    }),
  ])
  console.log('✅ Vínculos equipamento-usuário criados')

  // Licenças de usuários
  const m365 = await prisma.tipoLicenca.findUnique({ where: { nome: 'Microsoft 365 Business Standard' } })
  const exchange = await prisma.tipoLicenca.findUnique({ where: { nome: 'Exchange Online Plan 1' } })
  const powerBi = await prisma.tipoLicenca.findUnique({ where: { nome: 'Power BI Pro' } })

  if (m365 && exchange && powerBi) {
    await Promise.all([
      prisma.licencaUsuario.upsert({ where: { id: 1 }, update: {}, create: { id: 1, colaboradorId: '111.111.111-11', licencaId: m365.id } }),
      prisma.licencaUsuario.upsert({ where: { id: 2 }, update: {}, create: { id: 2, colaboradorId: '111.111.111-11', licencaId: exchange.id } }),
      prisma.licencaUsuario.upsert({ where: { id: 3 }, update: {}, create: { id: 3, colaboradorId: '222.222.222-22', licencaId: m365.id } }),
      prisma.licencaUsuario.upsert({ where: { id: 4 }, update: {}, create: { id: 4, colaboradorId: '222.222.222-22', licencaId: powerBi.id } }),
      prisma.licencaUsuario.upsert({ where: { id: 5 }, update: {}, create: { id: 5, colaboradorId: '333.333.333-33', licencaId: m365.id } }),
    ])
  }
  console.log('✅ Licenças de usuários criadas')

  // Usuário administrador do sistema
  const senhaHash = await bcrypt.hash('Admin@Cassol2024', 12)
  await prisma.usuarioSistema.upsert({
    where: { email: 'admin@cassol.com.br' },
    update: {},
    create: {
      email: 'admin@cassol.com.br',
      nome: 'Administrador do Sistema',
      senha: senhaHash,
      perfil: PerfilAcesso.Administrador,
      empresasIds: [1, 2, 3, 4, 5, 6],
    }
  })

  await prisma.usuarioSistema.upsert({
    where: { email: 'gestor.ti@cassol.com.br' },
    update: {},
    create: {
      email: 'gestor.ti@cassol.com.br',
      nome: 'Carlos Eduardo Santos',
      senha: await bcrypt.hash('GestorTI@2024', 12),
      perfil: PerfilAcesso.GestorTI,
      empresasIds: [1, 2, 3],
    }
  })
  console.log('✅ Usuários do sistema criados')

  // Categorias de perfil de hardware
  await Promise.all([
    prisma.categoriaPerfil.upsert({ where: { nome: 'BÁSICO 01' }, update: {}, create: { nome: 'BÁSICO 01', processamento: 'Intel Core i3 / Ryzen 3', ram: '8GB', memoriaDisco: '256GB SSD', mobilidade: false, licencaOffice: 'Microsoft 365 Apps', fabric: false, project: false, powerBi: false } }),
    prisma.categoriaPerfil.upsert({ where: { nome: 'BÁSICO 02' }, update: {}, create: { nome: 'BÁSICO 02', processamento: 'Intel Core i5 / Ryzen 5', ram: '8GB', memoriaDisco: '256GB SSD', mobilidade: true, licencaOffice: 'Microsoft 365 Business Standard', fabric: false, project: false, powerBi: false } }),
    prisma.categoriaPerfil.upsert({ where: { nome: 'INTERMEDIÁRIO' }, update: {}, create: { nome: 'INTERMEDIÁRIO', processamento: 'Intel Core i5 / Ryzen 5', ram: '16GB', memoriaDisco: '512GB SSD', mobilidade: true, licencaOffice: 'Microsoft 365 Business Standard', fabric: false, project: false, powerBi: true } }),
    prisma.categoriaPerfil.upsert({ where: { nome: 'AVANÇADO' }, update: {}, create: { nome: 'AVANÇADO', processamento: 'Intel Core i7 / Ryzen 7', ram: '16GB', memoriaDisco: '512GB SSD', mobilidade: true, licencaOffice: 'Microsoft 365 Business Premium', fabric: true, project: true, powerBi: true } }),
    prisma.categoriaPerfil.upsert({ where: { nome: 'EXECUTIVO' }, update: {}, create: { nome: 'EXECUTIVO', processamento: 'Intel Core i7/i9 / Apple M-series', ram: '32GB', memoriaDisco: '1TB SSD', mobilidade: true, licencaOffice: 'Microsoft 365 Business Premium', fabric: true, project: true, powerBi: true } }),
  ])
  console.log('✅ Categorias de perfil criadas')

  // Ocorrência de exemplo
  await prisma.ocorrencia.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nserial: 'NB-DELL-001',
      tipo: 'Manutenção',
      descricao: 'Troca de bateria realizada. Bateria apresentava degradação acima de 80%.',
      dataOcorr: new Date('2024-08-10'),
      resolvidoEm: new Date('2024-08-12'),
    }
  })
  console.log('✅ Ocorrência de exemplo criada')

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('📧 Login admin: admin@cassol.com.br')
  console.log('🔑 Senha admin: Admin@Cassol2024')
}

main()
  .catch((e) => { console.error('❌ Erro no seed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
