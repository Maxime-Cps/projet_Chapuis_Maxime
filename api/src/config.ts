export interface DatabaseConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  bdname: string;
}

export interface AppConfig {
  BDD: DatabaseConfig;
  /** Key signing session tokens (utils/token.ts). */
  AUTH_SECRET: string;
}

export const config: AppConfig = {
  BDD: {
    host: process.env.DB_HOST ?? "",
    port: process.env.DB_PORT || "5432",
    user: process.env.DB_USER ?? "",
    password: process.env.DB_PASSWORD ?? "",
    bdname: process.env.DB_NAME ?? ""
  },
  AUTH_SECRET: process.env.AUTH_SECRET ?? ""
};

export const { BDD, AUTH_SECRET } = config;
export default config;
