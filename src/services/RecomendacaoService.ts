import { RecomendacaoCreateDTO } from '../models/RecomendacaoSchema';
import { candidatoService } from './CandidatoService';
import { vagaService } from './VagaService';

class RecomendacaoService {
  // TODO: Verificar necessidade de deixar os id's opcionais no tipo RecomendacaoCreateDTO
  async create(data: RecomendacaoCreateDTO) {
    if (data.tipo == 'VAGAS_PARA_CANDIDATO') {
      this.geraRecomendacaoVagas(data);
    } else {
      this.geraRecomendacaoCandidatos(data);
    }
  }

  geraRecomendacaoVagas = async (data: RecomendacaoCreateDTO) => {
    const {
      areaAtuacao,
      nivelEscolaridade,
      periodoConclusao,
      disponivel,
      tempoDisponivel,
      lattes,
      areasInteresse,
      habilidades,
    } = await candidatoService.getById(data.candidatoId);
  };

  geraRecomendacaoCandidatos = (data: RecomendacaoCreateDTO) => {};
}
