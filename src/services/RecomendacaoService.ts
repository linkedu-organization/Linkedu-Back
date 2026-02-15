import { RecomendacaoCandidatoResponse } from '../models/RecomendacaoSchema';
import { candidatoService } from './CandidatoService';
import { vagaService } from './VagaService';

class RecomendacaoService {
  // TODO: Verificar necessidade de deixar os id's opcionais no tipo RecomendacaoCreateDTO
  async create(data: RecomendacaoCandidatoResponse) {
    if (data.tipo == 'VAGAS_PARA_CANDIDATO') {
      this.geraRecomendacaoVagas(data);
    } else {
      this.geraRecomendacaoCandidatos(data);
    }
  }

  geraRecomendacaoVagas = async (data: RecomendacaoCandidatoResponse) => {
    const {
      areaAtuacao,
      nivelEscolaridade,
      periodoConclusao,
      disponivel,
      tempoDisponivel,
      lattes,
      areasInteresse,
      habilidades,
      embedding,
    } = await candidatoService.getById(data.candidatoId);
  };

  geraRecomendacaoCandidatos = (data: RecomendacaoCandidatoResponse) => {};
}
