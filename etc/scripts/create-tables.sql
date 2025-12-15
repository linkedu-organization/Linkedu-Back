CREATE TABLE IF NOT EXISTS perfil (
  id SERIAL NOT NULL,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL,
  tipo VARCHAR(50) NOT NULL, /* enum TipoPerfil (ALUNO, TECNICO, PROFESSOR, PESQUISADOR, PROFESSOR_PESQUISADOR) */
  senha VARCHAR(255) NOT NULL,
  biografia VARCHAR(255),
  foto VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  ultimo_acesso TIMESTAMP,
  CONSTRAINT pk_perfil PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS aluno (
  id SERIAL NOT NULL,
  perfil_id INTEGER NOT NULL UNIQUE,
  instituicao VARCHAR(255) NOT NULL,
  area_atuacao VARCHAR(255) NOT NULL,
  nivel_escolaridade VARCHAR(100) NOT NULL, /* enum NivelEscolaridade */
  periodo_ingresso CHAR(6),
  periodo_conclusao CHAR(6),
  disponivel BOOLEAN NOT NULL,
  tempo_disponivel VARCHAR(50) NOT NULL, /* enum CargaHoraria */
  lattes VARCHAR(100),
  linkedin VARCHAR(100),
  CONSTRAINT pk_aluno PRIMARY KEY (id),
  CONSTRAINT fk_aluno_perfil FOREIGN KEY (perfil_id) REFERENCES perfil (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS area_interesse_aluno (
  aluno_id INTEGER NOT NULL,
  area_interesse VARCHAR(255) NOT NULL,
  CONSTRAINT pk_area_interesse_aluno PRIMARY KEY (aluno_id, area_interesse),
  CONSTRAINT fk_area_interesse_aluno FOREIGN KEY (aluno_id) REFERENCES aluno (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS habilidade_aluno (
  aluno_id INTEGER NOT NULL,
  habilidade VARCHAR(255) NOT NULL,
  CONSTRAINT pk_habilidade_aluno PRIMARY KEY (aluno_id, habilidade),
  CONSTRAINT fk_habilidade_aluno FOREIGN KEY (aluno_id) REFERENCES aluno (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS experiencia (
  id SERIAL NOT NULL,
  aluno_id INTEGER NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  orientador VARCHAR(255) NOT NULL,
  instituicao VARCHAR(255) NOT NULL,
  periodo_inicio CHAR(6) NOT NULL,
  periodo_fim CHAR(6),
  local VARCHAR(255) NOT NULL,
  CONSTRAINT pk_experiencia PRIMARY KEY (id),
  CONSTRAINT fk_experiencia_aluno FOREIGN KEY (aluno_id) REFERENCES aluno (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS professor (
  id SERIAL NOT NULL,
  perfil_id INTEGER NOT NULL UNIQUE,
  instituicao VARCHAR(255) NOT NULL,
  area_atuacao VARCHAR(255) NOT NULL,
  laboratorios VARCHAR(255) NOT NULL,
  CONSTRAINT pk_professor PRIMARY KEY (id),
  CONSTRAINT fk_professor_perfil FOREIGN KEY (perfil_id) REFERENCES perfil (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS vaga (
  id SERIAL NOT NULL,
  professor_id INTEGER NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL, /* enum CategoriaVaga */
  eh_publica BOOLEAN NOT NULL,
  eh_remunerada BOOLEAN NOT NULL,
  data_expiracao CHAR(8),
  duracao VARCHAR(50) NOT NULL,
  instituicao VARCHAR(255) NOT NULL,
  curso VARCHAR(255) NOT NULL,
  link_inscricao VARCHAR(100) NOT NULL,
  local VARCHAR(255) NOT NULL,
  CONSTRAINT pk_vaga PRIMARY KEY (id),
  CONSTRAINT fk_vaga_professor FOREIGN KEY (professor_id) REFERENCES professor (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS carga_horaria_vaga (
  vaga_id INTEGER NOT NULL,
  carga_horaria VARCHAR(50) NOT NULL, /* enum CargaHoraria */
  CONSTRAINT pk_carga_horaria_vaga PRIMARY KEY (vaga_id, carga_horaria),
  CONSTRAINT fk_carga_horaria_vaga FOREIGN KEY (vaga_id) REFERENCES vaga (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS publico_alvo_vaga (
  vaga_id INTEGER NOT NULL,
  publico_alvo VARCHAR(255) NOT NULL, /* enum PublicoAlvoVaga */
  CONSTRAINT pk_publico_alvo_vaga PRIMARY KEY (vaga_id, publico_alvo),
  CONSTRAINT fk_publico_alvo_vaga FOREIGN KEY (vaga_id) REFERENCES vaga (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conhecimento_obrigatorio_vaga (
  vaga_id INTEGER NOT NULL,
  conhecimento_obrigatorio VARCHAR(255) NOT NULL,
  CONSTRAINT pk_conhecimento_obrigatorio_vaga PRIMARY KEY (vaga_id, conhecimento_obrigatorio),
  CONSTRAINT fk_conhecimento_obrigatorio_vaga FOREIGN KEY (vaga_id) REFERENCES vaga (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS conhecimento_opcional_vaga (
  vaga_id INTEGER NOT NULL,
  conhecimento_opcional VARCHAR(255) NOT NULL,
  CONSTRAINT pk_conhecimento_opcional_vaga PRIMARY KEY (vaga_id, conhecimento_opcional),
  CONSTRAINT fk_conhecimento_opcional_vaga FOREIGN KEY (vaga_id) REFERENCES vaga (id) ON DELETE CASCADE
);

CREATE TABLE  IF NOT EXISTS candidatos_recomendados (
  aluno_id INTEGER NOT NULL,
  vaga_id INTEGER NOT NULL,
  dt_ult_processamento TIMESTAMP NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  CONSTRAINT pk_candidato_recomendado_vaga PRIMARY KEY (aluno_id, vaga_id),
  CONSTRAINT fk_candidato_recomendado FOREIGN KEY (aluno_id) REFERENCES aluno (id) ON DELETE CASCADE,
  CONSTRAINT fk_vaga FOREIGN KEY (vaga_id) REFERENCES vaga (id) ON DELETE CASCADE
);

CREATE TABLE  IF NOT EXISTS vagas_recomendadas (
  vaga_id INTEGER NOT NULL,
  aluno_id INTEGER NOT NULL,
  dt_ult_processamento TIMESTAMP NOT NULL,
  descricao VARCHAR(255) NOT NULL,
  CONSTRAINT pk_vaga_recomendada_aluno PRIMARY KEY (vaga_id, aluno_id),
  CONSTRAINT fk_vaga_recomendada FOREIGN KEY (vaga_id) REFERENCES vaga (id) ON DELETE CASCADE,
  CONSTRAINT fk_aluno FOREIGN KEY (aluno_id) REFERENCES aluno (id) ON DELETE CASCADE
);
