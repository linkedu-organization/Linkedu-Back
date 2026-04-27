import cron from 'node-cron';
import { subDays } from 'date-fns';

import { sendEmail } from './utils/mailer';
import { perfilRepository } from './repositories/PerfilRepositoy';
import { candidatoRepository } from './repositories/CandidatoRepository';

cron.schedule('18 21 * * *', async () => {
  const limite = subDays(new Date(), 30);
  const candidatosInativos = await candidatoRepository.getInativos(limite);

  for (const candidato of candidatosInativos) {
    try {
      await sendEmail({
        to: candidato.perfil.email,
        subject: 'Seu perfil do Linkedu está inativo',
        template: 'template-email-perfil-inativo.html',
        replacements: { loginLink: `${process.env.FRONTEND_URL}/login` },
      });

      await perfilRepository.marcarEmailInatividadeEnviado(candidato.perfil.id);
    } catch (error) {
      console.error('Erro ao enviar email para: ', candidato.perfil.email, error);
    }
  }
});
