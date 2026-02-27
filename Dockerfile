version: '3.8'

services:
  db:
    image: postgres:15
    container_name: ${POSTGRES_DB_NAME}
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

  app:
    build: .
    container_name: linkedu-back
    restart: always
    ports:
      - '3333:3333'
    environment:
      DATABASE_URL: ${DATABASE_URL}
      GEMINI_API_KEY: ${GEMINI_API_KEY}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - db

volumes:
  pgdata:
    driver: local