
export class LocalSmartService {
  private suggestionsPool: Record<string, string[]> = {
    'Propriedade Integral': [
      "Verificar pressão hidráulica de todos os chuveiros",
      "Testar vedação e trilhos das portas de correr da varanda",
      "Conferir nível de gás nos botijões (fogão e sauna)",
      "Vistoriar integridade das redes de descanso e ganchos",
      "Testar repetidor de sinal Wi-Fi em todos os cômodos",
      "Conferir limpeza profunda sob as camas de casal",
      "Verificar lâmpadas da área gourmet e piscina",
      "Testar funcionamento da Airfryer e Freezer",
      "Vistoriar box dos banheiros para possíveis trincas",
      "Conferir kit de churrasco e estado da grelha"
    ],
    'Padrão': [
      "Verificar frigobar e data de validade dos itens",
      "Testar todos os pontos de iluminação e tomadas",
      "Vistoriar enxoval para manchas ou furos",
      "Conferir controle remoto da TV e pilhas",
      "Testar fechadura eletrônica/manual da porta principal"
    ]
  };

  async suggestTasks(roomType: string, status: string): Promise<string[]> {
    // Simula um processamento local rápido
    await new Promise(resolve => setTimeout(resolve, 400));

    const pool = this.suggestionsPool[roomType] || this.suggestionsPool['Padrão'];
    
    // Seleciona 4 tarefas aleatórias para diversificar a auditoria
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  }
}

export const smartService = new LocalSmartService();
