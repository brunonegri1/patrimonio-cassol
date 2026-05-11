import { NextRequest, NextResponse } from 'next/server'

// ROTA TEMPORÁRIA DE SETUP — remover após uso!
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Import dinâmico para evitar problema de build
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const resultados: string[] = []

    // Tipos de Equipamento
    await prisma.tipoEquipamento.createMany({
      data: [
        { nome: 'Notebook', icone: 'laptop' },
        { nome: 'Desktop', icone: 'monitor' },
        { nome: 'Servidor', icone: 'server' },
        { nome: 'Monitor', icone: 'monitor' },
        { nome: 'Mouse', icone: 'mouse-pointer' },
        { nome: 'Teclado', icone: 'keyboard' },
        { nome: 'Coletor', icone: 'scan' },
      ],
      skipDuplicates: true,
    })
    resultados.push('✅ Tipos de equipamento')

    // Marcas
    await prisma.marca.createMany({
      data: [
        { nome: 'Dell' }, { nome: 'Lenovo' }, { nome: 'HP' },
        { nome: 'Apple' }, { nome: 'Samsung' }, { nome: 'Datalogic' },
      ],
      skipDuplicates: true,
    })
    resultados.push('✅ Marcas')

    // Tipos de Posse
    await prisma.tipoPosse.createMany({
      data: [{ categoria: 'Próprio' }, { categoria: 'Alugado' }, { categoria: 'Particular' }],
      skipDuplicates: true,
    })
    resultados.push('✅ Tipos de posse')

    // Tipos de Licença
    await prisma.tipoLicenca.createMany({
      data: [
        { nome: 'Microsoft 365 Business Standard', tipo: 'Office', descricao: 'Suite Office completa + Teams', custo: 57.00 },
        { nome: 'Exchange Online Plan 1', tipo: 'Email', descricao: 'Email corporativo 50GB', custo: 17.00 },
        { nome: 'Power BI Pro', tipo: 'Analytics', descricao: 'Business Intelligence', custo: 57.00 },
        { nome: 'Microsoft Fabric', tipo: 'Analytics', descricao: 'Data platform unificada', custo: 115.00 },
        { nome: 'Microsoft Project Plan 3', tipo: 'Gestão', descricao: 'Gerenciamento de projetos', custo: 57.00 },
      ],
      skipDuplicates: true,
    })
    resultados.push('✅ Tipos de licença')

    // Empresas
    for (const empresa of [
      { id: 1, nome: 'Cassol Materiais de Construção', cnpj: '00.000.001/0001-00' },
      { id: 2, nome: 'Cassol Pré-Fabricados', cnpj: '00.000.002/0001-00' },
      { id: 3, nome: 'Cassol Logística', cnpj: '00.000.003/0001-00' },
      { id: 4, nome: 'Cassol Real Estate', cnpj: '00.000.004/0001-00' },
      { id: 5, nome: 'Cassol Florestal', cnpj: '00.000.005/0001-00' },
      { id: 6, nome: 'Cassol Administradora de Cartões', cnpj: '00.000.006/0001-00' },
    ]) {
      await prisma.empresa.upsert({ where: { id: empresa.id }, update: {}, create: empresa })
    }
    resultados.push('✅ Empresas')

    // Unidades
    for (const u of [
      { id: 1, nome: 'Matriz - Florianópolis', uf: 'SC', empresaId: 1 },
      { id: 2, nome: 'Filial Joinville', uf: 'SC', empresaId: 1 },
      { id: 3, nome: 'Sede Pré-Fabricados', uf: 'SC', empresaId: 2 },
      { id: 4, nome: 'Centro Logístico Palhoça', uf: 'SC', empresaId: 3 },
      { id: 5, nome: 'Escritório Real Estate', uf: 'SC', empresaId: 4 },
    ]) {
      await prisma.unidade.upsert({ where: { id: u.id }, update: {}, create: u })
    }
    resultados.push('✅ Unidades')

    // Contrato
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
      },
    })
    resultados.push('✅ Contrato')

    // Colaboradores
    for (const c of [
      { id: '111.111.111-11', matricula: '001001', nome: 'Ana Paula Ferreira', cargo: 'Analista de TI', setor: 'Tecnologia da Informação', unidadeId: 1, tipoTrabalho: 'CLT' as const, situacao: 'Trabalhando' as const, dataAdmissao: new Date('2020-03-01'), userRede: 'ana.ferreira', email: 'ana.ferreira@cassol.com.br' },
      { id: '222.222.222-22', matricula: '001002', nome: 'Carlos Eduardo Santos', cargo: 'Gerente de TI', setor: 'Tecnologia da Informação', unidadeId: 1, tipoTrabalho: 'CLT' as const, situacao: 'Trabalhando' as const, dataAdmissao: new Date('2018-06-15'), userRede: 'carlos.santos', email: 'carlos.santos@cassol.com.br' },
      { id: '333.333.333-33', matricula: '002001', nome: 'Mariana Oliveira Costa', cargo: 'Analista Financeiro', setor: 'Financeiro', unidadeId: 2, tipoTrabalho: 'CLT' as const, situacao: 'Trabalhando' as const, dataAdmissao: new Date('2021-09-01'), userRede: 'mariana.costa', email: 'mariana.costa@cassol.com.br' },
      { id: '444.444.444-44', matricula: '003001', nome: 'Roberto Lima Pereira', cargo: 'Técnico de Suporte', setor: 'Tecnologia da Informação', unidadeId: 3, tipoTrabalho: 'Terceiro' as const, situacao: 'Trabalhando' as const, dataAdmissao: new Date('2022-01-10'), userRede: 'roberto.pereira', email: 'roberto.pereira@cassol.com.br' },
      { id: '555.555.555-55', matricula: '001003', nome: 'Fernanda Rodrigues Silva', cargo: 'Coordenadora de RH', setor: 'Recursos Humanos', unidadeId: 1, tipoTrabalho: 'CLT' as const, situacao: 'Afastado' as const, dataAdmissao: new Date('2019-11-20'), userRede: 'fernanda.silva', email: 'fernanda.silva@cassol.com.br' },
    ]) {
      await prisma.colaborador.upsert({ where: { id: c.id }, update: {}, create: c })
    }
    resultados.push('✅ Colaboradores')

    // Equipamentos
    const tipoNB = await prisma.tipoEquipamento.findUnique({ where: { nome: 'Notebook' } })
    const tipoDT = await prisma.tipoEquipamento.findUnique({ where: { nome: 'Desktop' } })
    const tipoMN = await prisma.tipoEquipamento.findUnique({ where: { nome: 'Monitor' } })
    const tipoCL = await prisma.tipoEquipamento.findUnique({ where: { nome: 'Coletor' } })
    const posseP = await prisma.tipoPosse.findUnique({ where: { categoria: 'Próprio' } })
    const posseA = await prisma.tipoPosse.findUnique({ where: { categoria: 'Alugado' } })
    const possePT = await prisma.tipoPosse.findUnique({ where: { categoria: 'Particular' } })
    const marcaDell = await prisma.marca.findUnique({ where: { nome: 'Dell' } })
    const marcaLen = await prisma.marca.findUnique({ where: { nome: 'Lenovo' } })
    const marcaHP = await prisma.marca.findUnique({ where: { nome: 'HP' } })
    const marcaAPL = await prisma.marca.findUnique({ where: { nome: 'Apple' } })
    const marcaDat = await prisma.marca.findUnique({ where: { nome: 'Datalogic' } })

    if (tipoNB && tipoDT && tipoMN && tipoCL && posseP && posseA && possePT && marcaDell && marcaLen && marcaHP && marcaAPL && marcaDat) {
      for (const e of [
        { nserial: 'NB-DELL-001', status: 'Ativo' as const, patrimonio: 'PAT-001', tipoEquipId: tipoNB.id, posseId: posseA.id, marcaId: marcaDell.id, unidadeId: 1, contratoId: contrato.id, modelo: 'Latitude 5540', processador: 'Intel Core i7-1365U', ram: '16GB', memoriaDisco: '512GB SSD' },
        { nserial: 'NB-DELL-002', status: 'Ativo' as const, patrimonio: 'PAT-002', tipoEquipId: tipoNB.id, posseId: posseA.id, marcaId: marcaDell.id, unidadeId: 1, contratoId: contrato.id, modelo: 'Latitude 5540', processador: 'Intel Core i7-1365U', ram: '16GB', memoriaDisco: '512GB SSD' },
        { nserial: 'NB-LEN-003', status: 'Ativo' as const, patrimonio: 'PAT-003', tipoEquipId: tipoNB.id, posseId: posseP.id, marcaId: marcaLen.id, unidadeId: 2, modelo: 'ThinkPad E14', processador: 'AMD Ryzen 5 5600U', ram: '8GB', memoriaDisco: '256GB SSD' },
        { nserial: 'DT-HP-001', status: 'Ativo' as const, patrimonio: 'PAT-004', tipoEquipId: tipoDT.id, posseId: posseP.id, marcaId: marcaHP.id, unidadeId: 3, modelo: 'EliteDesk 800 G9', processador: 'Intel Core i5-13500', ram: '16GB', memoriaDisco: '512GB SSD' },
        { nserial: 'MN-DELL-001', status: 'Ativo' as const, patrimonio: 'PAT-005', tipoEquipId: tipoMN.id, posseId: posseP.id, marcaId: marcaDell.id, unidadeId: 1, modelo: 'P2422H' },
        { nserial: 'NB-DELL-003', status: 'Estoque' as const, patrimonio: 'PAT-006', tipoEquipId: tipoNB.id, posseId: posseA.id, marcaId: marcaDell.id, unidadeId: 1, contratoId: contrato.id, modelo: 'Latitude 5540', processador: 'Intel Core i7-1365U', ram: '16GB', memoriaDisco: '512GB SSD' },
        { nserial: 'CLT-DAT-001', status: 'Ativo' as const, patrimonio: 'PAT-007', tipoEquipId: tipoCL.id, posseId: posseP.id, marcaId: marcaDat.id, unidadeId: 4, modelo: 'Memor 20' },
        { nserial: 'NB-APL-001', status: 'Ativo' as const, tipoEquipId: tipoNB.id, posseId: possePT.id, marcaId: marcaAPL.id, unidadeId: 1, modelo: 'MacBook Pro M3', processador: 'Apple M3 Pro', ram: '18GB', memoriaDisco: '512GB SSD' },
      ]) {
        await prisma.equipamento.upsert({ where: { nserial: e.nserial }, update: {}, create: { ...e, dataAtualizacao: new Date() } })
      }
    }
    resultados.push('✅ Equipamentos')

    // Vínculos
    for (const v of [
      { nserial: 'NB-DELL-001', colaboradorId: '111.111.111-11', unidadeId: 1, cargo: 'Analista de TI', setor: 'TI', principal: true },
      { nserial: 'NB-DELL-002', colaboradorId: '222.222.222-22', unidadeId: 1, cargo: 'Gerente de TI', setor: 'TI', principal: true },
      { nserial: 'NB-LEN-003', colaboradorId: '333.333.333-33', unidadeId: 2, cargo: 'Analista Financeiro', setor: 'Financeiro', principal: true },
      { nserial: 'DT-HP-001', colaboradorId: '444.444.444-44', unidadeId: 3, cargo: 'Técnico de Suporte', setor: 'TI', principal: true },
      { nserial: 'MN-DELL-001', colaboradorId: '222.222.222-22', unidadeId: 1, cargo: 'Gerente de TI', setor: 'TI', principal: false },
    ]) {
      await prisma.equipamentoUsuario.upsert({
        where: { nserial_colaboradorId: { nserial: v.nserial, colaboradorId: v.colaboradorId } },
        update: {},
        create: v,
      })
    }
    resultados.push('✅ Vínculos equipamento-usuário')

    // Licenças
    const m365 = await prisma.tipoLicenca.findUnique({ where: { nome: 'Microsoft 365 Business Standard' } })
    const exchange = await prisma.tipoLicenca.findUnique({ where: { nome: 'Exchange Online Plan 1' } })
    const powerbi = await prisma.tipoLicenca.findUnique({ where: { nome: 'Power BI Pro' } })
    if (m365 && exchange && powerbi) {
      for (const l of [
        { colaboradorId: '111.111.111-11', licencaId: m365.id },
        { colaboradorId: '111.111.111-11', licencaId: exchange.id },
        { colaboradorId: '222.222.222-22', licencaId: m365.id },
        { colaboradorId: '222.222.222-22', licencaId: powerbi.id },
        { colaboradorId: '333.333.333-33', licencaId: m365.id },
      ]) {
        await prisma.licencaUsuario.create({ data: l }).catch(() => {})
      }
    }
    resultados.push('✅ Licenças')

    // Usuário admin
    const bcrypt = await import('bcryptjs')
    const senhaAdmin = await bcrypt.hash('Admin@Cassol2024', 12)
    const senhaGestor = await bcrypt.hash('GestorTI@2024', 12)

    await prisma.usuarioSistema.upsert({
      where: { email: 'admin@cassol.com.br' },
      update: {},
      create: { email: 'admin@cassol.com.br', nome: 'Administrador do Sistema', senha: senhaAdmin, perfil: 'Administrador', empresasIds: [1,2,3,4,5,6] },
    })
    await prisma.usuarioSistema.upsert({
      where: { email: 'gestor.ti@cassol.com.br' },
      update: {},
      create: { email: 'gestor.ti@cassol.com.br', nome: 'Carlos Eduardo Santos', senha: senhaGestor, perfil: 'GestorTI', empresasIds: [1,2,3] },
    })
    resultados.push('✅ Usuários do sistema')

    await prisma.$disconnect()
    return NextResponse.json({ sucesso: true, resultados })
  } catch (error: any) {
    return NextResponse.json({ erro: error.message, stack: error.stack?.substring(0, 500) }, { status: 500 })
  }
}
