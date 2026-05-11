'use server'

import { prisma } from '@/lib/prisma'
import { Alerta } from '@/types'

export async function verificarAlertas(): Promise<Alerta[]> {
  const alertas: Alerta[] = []
  const hoje = new Date()

  // 1. Contratos vencendo em 30 dias
  const em30dias = new Date(hoje)
  em30dias.setDate(em30dias.getDate() + 30)

  const contratosVencendo = await prisma.contrato.findMany({
    where: { dataFinal: { lte: em30dias, gte: hoje } },
    include: { equipamentos: true },
  })

  for (const contrato of contratosVencendo) {
    const diasRestantes = Math.ceil((contrato.dataFinal.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    const urgencia = diasRestantes <= 7 ? 'alta' : diasRestantes <= 15 ? 'media' : 'baixa'

    alertas.push({
      tipo: 'CONTRATO_VENCENDO',
      titulo: `Contrato ${contrato.numero} vence em ${diasRestantes} dias`,
      descricao: `Fornecedor: ${contrato.fornecedor || 'N/A'} — ${contrato.equipamentos.length} equipamentos vinculados`,
      urgencia,
      link: `/contratos/${contrato.id}`,
      dadosExtras: { contratoId: contrato.id, diasRestantes },
    })
  }

  // 2. Equipamentos ativos sem usuário
  const equipSemUsuario = await prisma.equipamento.findMany({
    where: {
      ativo: true,
      status: 'Ativo',
      usuarios: { none: { dataDesvinculo: null } },
    },
    include: { tipoEquip: true, unidade: { include: { empresa: true } } },
  })

  if (equipSemUsuario.length > 0) {
    alertas.push({
      tipo: 'EQUIP_SEM_USUARIO',
      titulo: `${equipSemUsuario.length} equipamento(s) ativo(s) sem usuário`,
      descricao: 'Equipamentos marcados como Ativo mas sem colaborador vinculado',
      urgencia: 'media',
      link: '/equipamentos?status=Ativo&semUsuario=true',
      dadosExtras: { quantidade: equipSemUsuario.length },
    })
  }

  // 3. Colaboradores desligados com equipamento ainda vinculado
  const desligadosComEquip = await prisma.colaborador.findMany({
    where: {
      situacao: 'Desligado',
      equipamentos: { some: { dataDesvinculo: null } },
    },
    include: {
      equipamentos: {
        where: { dataDesvinculo: null },
        include: { equipamento: { include: { tipoEquip: true } } },
      },
    },
  })

  for (const colab of desligadosComEquip) {
    alertas.push({
      tipo: 'USUARIO_DESLIGADO_COM_EQUIP',
      titulo: `Recolher equipamento de ${colab.nome}`,
      descricao: `Colaborador desligado com ${colab.equipamentos.length} equipamento(s) pendente(s) de devolução`,
      urgencia: 'alta',
      link: `/colaboradores/${colab.id}`,
      dadosExtras: { colaboradorId: colab.id, equipamentos: colab.equipamentos.map(e => e.nserial) },
    })
  }

  // 4. Termos de responsabilidade não digitalizados
  const termosPendentes = await prisma.termoEquipamento.count({
    where: { termoDigitalizado: false },
  })

  if (termosPendentes > 0) {
    alertas.push({
      tipo: 'TERMO_PENDENTE',
      titulo: `${termosPendentes} termo(s) não digitalizado(s)`,
      descricao: 'Termos de responsabilidade assinados que ainda não foram digitalizados no sistema',
      urgencia: 'baixa',
      link: '/colaboradores?termosPendentes=true',
      dadosExtras: { quantidade: termosPendentes },
    })
  }

  // Ordena por urgência
  const ordemUrgencia = { alta: 0, media: 1, baixa: 2 }
  return alertas.sort((a, b) => ordemUrgencia[a.urgencia] - ordemUrgencia[b.urgencia])
}
