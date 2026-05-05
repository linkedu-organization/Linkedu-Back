import { subDays } from 'date-fns';

import { candidatoRepository } from '../repositories/CandidatoRepository';
import { perfilRepository } from '../repositories/PerfilRepositoy';
import { sendEmail } from '../utils/mailer';
import { AppError } from '../errors/AppError';

class JobService {
  async runInatividadeJob() {
    const limite = subDays(new Date(), 30);
    const candidatosInativos = await candidatoRepository.getInativos(limite);

    for (const candidato of candidatosInativos) {
      const nome = candidato.perfil.nome.split(' ')[0] ?? 'Olá';
      try {
        await sendEmail({
          to: candidato.perfil.email,
          subject: 'Seu perfil do Linkedu está inativo',
          template: 'template-email-perfil-inativo.html',
          replacements: { nome, loginLink: `${process.env.FRONTEND_URL}/login` },
        });

        await perfilRepository.marcarEmailInatividadeEnviado(candidato.perfil.id);
      } catch (error) {
        console.error(error);
        throw new AppError('Erro ao enviar email para: ' + candidato.perfil.email, 500);
      }
    }
  }
}

export const jobService = new JobService();
