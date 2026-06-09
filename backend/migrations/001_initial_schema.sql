CREATE TABLE IF NOT EXISTS usuarios (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefone VARCHAR(30),
    senha VARCHAR(255) NOT NULL,
    foto_perfil TEXT,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alertas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(40) NOT NULL CHECK (
        tipo IN (
            'ASSALTO_ROUBO',
            'ATIVIDADE_SUSPEITA',
            'FALTA_ILUMINACAO',
            'ALAGAMENTO',
            'VIA_INTRANSITAVEL',
            'QUEDA_ENERGIA',
            'FALTA_AGUA',
            'OUTROS'
        )
    ),
    descricao TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    anonimo BOOLEAN NOT NULL DEFAULT FALSE,
    foto_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ativo' CHECK (
        status IN ('ativo', 'resolvido')
    ),
    resolvido BOOLEAN NOT NULL DEFAULT FALSE,
    confirmacoes INTEGER NOT NULL DEFAULT 0,
    discordancias INTEGER NOT NULL DEFAULT 0,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comentarios_alerta (
    id BIGSERIAL PRIMARY KEY,
    alerta_id BIGINT NOT NULL REFERENCES alertas(id) ON DELETE CASCADE,
    usuario_id BIGINT REFERENCES usuarios(id) ON DELETE SET NULL,
    comentario TEXT NOT NULL,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS confirmacoes_alerta (
    alerta_id BIGINT NOT NULL REFERENCES alertas(id) ON DELETE CASCADE,
    usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('CONFIRMA', 'DISCORDA')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (alerta_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS contatos_emergencia (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    telefone VARCHAR(30) NOT NULL UNIQUE,
    icone VARCHAR(60),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO contatos_emergencia (nome, telefone)
VALUES
    ('Policia Militar', '190'),
    ('Policia Civil', '197'),
    ('SAMU', '192'),
    ('Corpo de Bombeiros', '193')
ON CONFLICT (telefone) DO UPDATE
SET nome = EXCLUDED.nome;

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_alertas_usuario_id ON alertas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_alertas_status_criado_em ON alertas(status, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON alertas(tipo);
CREATE INDEX IF NOT EXISTS idx_comentarios_alerta_id ON comentarios_alerta(alerta_id);
