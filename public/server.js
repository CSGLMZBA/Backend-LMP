import app from '../src/app.js';
import { env } from '../src/config/env.js';
// This is the starting point for the backend logic
app.listen(env.PORT, () => {
  console.log(
    `Servidor corriendo en puerto ${env.PORT}`
  );
});