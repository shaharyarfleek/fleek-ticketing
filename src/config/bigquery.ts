export interface BigQueryConfig {
  projectId: string;
  keyFilename?: string;
  credentials?: {
    type: "service_account",
    project_id: "dogwood-baton-345622",
    private_key_id: "cb095a8885b50a63c12c59d71207d18251ae2bc3",
    private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCz7CBpQXURni38\nacJABBmd+WyZg2QpjM6bycNiqUw90snFW67TsQjjPAk4O8hTpVjIznOKuf+IeJNv\n3qL1j1vHeTTgRaz0Gh/C+D1ZjO4htF9eiBbzz4uM9o+QvkkmgrgKDL2/7vzHJtxF\nm37xP8GsLKAeqVLKf7tV5rqpSCCwuwZulKKOZ1JSM1/D7X3DSZKg0O7R4WNakRqd\nDgOemSTCWy16MaBxPWnoxWG7NcLBlCzZyictKDovyxmvK2OhCFPJEKvOGrirvciF\nizmJqcqD/fNYFGVMk3HFNUohr3TAJx0rSHUIjAhZnXbboFLaJ0XjLycYPUDAGWl8\nWNgaDikPAgMBAAECggEAR2v6+71ruvgnOhVDcoUOJDswhIn3V1UZaRdBM+ePp9UG\nmo0IC+mxZP7ejA+TOL0gzunBTPcDvIlcwaJH3yGu5bK0LjkKbIX4SL2hIOzEVOXU\nm+J69gLT2zu/Bs66nAp1AyxGoKu+dVH0S79rt1m/SFkYoMNHZbIpy/JA89T5gR26\nDhfUJWcH/G5Gkq/TwGjSA4qMH6PrQQ0hGqZsquXZwvmdEy+z8s0NANJ5I9o/ka5s\nKOheWghdyP1fE92oKeBovekdKuxX82eJQowcvC2a8jBUpZbrqjioIQlrNTIb8LEh\nKvEIxfgmzlGzrlVTXfCJ4dnqceCVsphhEZVkVROIrQKBgQDnuj7Jgu8DLRdxWuna\nicGLE21LelC7sYo6QLmB2CXeWInKzngnBy+ygoYDcqedzbUypCkADCyPQQu4Fhq2\n9174vK/a0iMvhzehHnbLOhQXtxLqO5aAh3dWbeG2Ex6wLixSlHQ4DxS6DoB4gNjg\nSAJIRgUQ5xw9MaSMVxLEXwmE9QKBgQDGxLr75FQWkY+uu+yuSa22sOwAzaIh3zu1\nFxVut1/yePVbKiUWGePCZGrfYT7hsKWsjTZzugMdGd2+J0AEC05WNW2pfWkv9m6o\nmtTFdB+Ryc+O5o+4w0a9xxtUL/hcMj4oy2JQp68kT2OHXE8nKYI77Hghy69lrpqd\nT+CtvHxTcwKBgH22eo2T7NrKQaeLbMbUaR1sIqUJ7HaG8Lh9mKYqfxDK86YEsQZr\nTaMIUG/aabigeqbIjD2sXRgyb4sk4sVUGj/TDYwm6FPGhZVxE31ZOsFK3oYYYaPE\n2icXYZYHdWSbCAyc4RfwhowRhfzZ2c6DAkn3QpRS7Oz924kPS+0gqedpAoGAPjIy\n/DzvHvy/RALjxYmihMcJohq2P/kVOs4VU8anjDzTMYqXfjntrdc0Jd/NCFv5C2xI\nfJ/Y95Mvcp/fhSRwh8NCJEXs0yg+ah3AtGRouHq4qtN0Z3EbQqj54Tb9dQP3tVYm\n1mwR/r+kuidlUTDI4q1UzeZpZNzk3pKvEE4pbQcCgYEAtHeTk+zebwwsgh/fvgGv\nhaI9t1HShDcY2bVFTgoRzMB3uxQcd4tTwDK2vOKlASxl/E485c68PO/4ec4HYVRe\nrBJWGLUCtbTGp9P3Gayyko/hoeSR4GNfP4DebVqoLrUIVqWHN8F98iZtsNVM6yJb\nikluP5HoEXYGhKcI5Dw/19c=\n-----END PRIVATE KEY-----\n",
    client_email: "mr-vibe-coding@dogwood-baton-345622.iam.gserviceaccount.com",
    client_id: "113675153033323966975",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/mr-vibe-coding%40dogwood-baton-345622.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
  }
  ;
}

export const bigQueryConfig: BigQueryConfig = {
  projectId: process.env.VITE_BIGQUERY_PROJECT_ID || '',
  keyFilename: process.env.VITE_BIGQUERY_KEY_PATH,
  credentials: process.env.VITE_BIGQUERY_CREDENTIALS ? 
    JSON.parse(process.env.VITE_BIGQUERY_CREDENTIALS) : undefined
};