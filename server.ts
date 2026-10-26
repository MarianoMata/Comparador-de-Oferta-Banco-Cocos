import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SESSION_SECRET = process.env.SESSION_SECRET || 'bn-seguros-session-secret-cr-2026';
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'usuarios.json');
const COMPARISONS_FILE = path.join(DATA_DIR, 'comparaciones.json');
const AUDIT_FILE = path.join(DATA_DIR, 'auditoria.json');

interface UserRecord {
  id: string;
  usuario: string;
  nombre: string;
  rol: 'administrador' | 'asesor';
  estado: 'activo' | 'suspendido';
  debeCambiarClave: boolean;
  fechaCreacion: string;
  ultimoAcceso: string | null;
  claveHash: string;
}

interface AuthenticatedRequest extends Request {
  user?: UserRecord;
}

// Ensure data folder and data files exist
function initDataStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Check or create data/usuarios.json with initial admin
  if (!fs.existsSync(USERS_FILE)) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('Fundepos2026*', salt);
    const initialUsers: UserRecord[] = [
      {
        id: 'usr-admin-001',
        usuario: 'admin',
        nombre: 'Administrador',
        rol: 'administrador',
        estado: 'activo',
        debeCambiarClave: true,
        fechaCreacion: new Date().toISOString(),
        ultimoAcceso: null,
        claveHash: hash,
      },
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(initialUsers, null, 2), 'utf-8');
    console.log('data/usuarios.json inicializado con el usuario admin.');
  }

  // Check or create data/comparaciones.json
  if (!fs.existsSync(COMPARISONS_FILE)) {
    fs.writeFileSync(COMPARISONS_FILE, JSON.stringify([], null, 2), 'utf-8');
  }

  // Check or create data/auditoria.json
  if (!fs.existsSync(AUDIT_FILE)) {
    fs.writeFileSync(AUDIT_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

function getUsuarios(): UserRecord[] {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    const content = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error('Error leyendo data/usuarios.json:', err);
    return [];
  }
}

function saveUsuarios(usuarios: UserRecord[]): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(usuarios, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error guardando data/usuarios.json:', err);
  }
}

function logAuditoria(usuarioId: string, usuario: string, accion: string, detalles: any): void {
  try {
    const auditEntries = fs.existsSync(AUDIT_FILE)
      ? JSON.parse(fs.readFileSync(AUDIT_FILE, 'utf-8') || '[]')
      : [];
    auditEntries.unshift({
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      usuarioId,
      usuario,
      accion,
      fecha: new Date().toISOString(),
      detalles,
    });
    // Keep max 2000 entries
    if (auditEntries.length > 2000) {
      auditEntries.length = 2000;
    }
    fs.writeFileSync(AUDIT_FILE, JSON.stringify(auditEntries, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error guardando en data/auditoria.json:', err);
  }
}

function saveComparacion(record: any): void {
  try {
    const records = fs.existsSync(COMPARISONS_FILE)
      ? JSON.parse(fs.readFileSync(COMPARISONS_FILE, 'utf-8') || '[]')
      : [];
    records.unshift(record);
    if (records.length > 1000) {
      records.length = 1000;
    }
    fs.writeFileSync(COMPARISONS_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error guardando en data/comparaciones.json:', err);
  }
}

function sanitizeUser(u: UserRecord) {
  return {
    id: u.id,
    usuario: u.usuario,
    nombre: u.nombre,
    rol: u.rol,
    estado: u.estado,
    debeCambiarClave: u.debeCambiarClave,
    fechaCreacion: u.fechaCreacion,
    ultimoAcceso: u.ultimoAcceso,
  };
}

// Session Token Helper (8 hours signed cookie)
function createSessionToken(userId: string): string {
  const expiresAt = Date.now() + 8 * 60 * 60 * 1000;
  const payload = `${userId}:${expiresAt}`;
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return Buffer.from(`${payload}:${sig}`).toString('base64');
}

function verifySessionToken(token: string): { userId: string } | null {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8');
    const parts = raw.split(':');
    if (parts.length !== 3) return null;
    const [userId, expiresAtStr, sig] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || Date.now() > expiresAt) return null;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(`${userId}:${expiresAtStr}`).digest('hex');
    if (sig !== expectedSig) return null;
    return { userId };
  } catch {
    return null;
  }
}

// Auth Middleware: requires valid session and active user
function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.bn_session;
  if (!token) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  const session = verifySessionToken(token);
  if (!session) {
    res.clearCookie('bn_session', { path: '/' });
    return res.status(401).json({ error: 'Sesión inválida o expirada' });
  }

  const users = getUsuarios();
  const user = users.find((u) => u.id === session.userId);
  if (!user) {
    res.clearCookie('bn_session', { path: '/' });
    return res.status(401).json({ error: 'Usuario no encontrado' });
  }

  if (user.estado === 'suspendido') {
    res.clearCookie('bn_session', { path: '/' });
    return res.status(403).json({ error: 'usuario suspendido, contacte al administrador' });
  }

  req.user = user;
  next();
}

async function startServer() {
  // Initialize storage
  initDataStorage();

  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  // Middleware
  app.use(cookieParser(SESSION_SECRET));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // ==========================================
  // AUTHENTICATION ENDPOINTS
  // ==========================================

  // POST /api/login: (usuario y contraseña)
  app.post('/api/login', async (req: Request, res: Response) => {
    try {
      const { usuario, contrasena } = req.body;

      if (!usuario || typeof usuario !== 'string' || !contrasena || typeof contrasena !== 'string') {
        return res.status(400).json({ error: 'usuario o contraseña incorrectos' });
      }

      const cleanUser = usuario.trim().toLowerCase();
      const users = getUsuarios();
      const user = users.find((u) => u.usuario.toLowerCase() === cleanUser);

      if (!user) {
        logAuditoria('anonimo', cleanUser, 'login_fallido', 'Usuario no existe');
        return res.status(401).json({ error: 'usuario o contraseña incorrectos' });
      }

      const passwordMatch = bcrypt.compareSync(contrasena, user.claveHash);
      if (!passwordMatch) {
        logAuditoria(user.id, user.usuario, 'login_fallido', 'Contraseña incorrecta');
        return res.status(401).json({ error: 'usuario o contraseña incorrectos' });
      }

      if (user.estado === 'suspendido') {
        logAuditoria(user.id, user.usuario, 'login_bloqueado', 'Usuario suspendido');
        return res.status(403).json({ error: 'usuario suspendido, contacte al administrador' });
      }

      // Update ultimoAcceso
      user.ultimoAcceso = new Date().toISOString();
      saveUsuarios(users);

      logAuditoria(user.id, user.usuario, 'login_exitoso', 'Sesión iniciada');

      // 8-hour HttpOnly signed session cookie
      const token = createSessionToken(user.id);
      res.cookie('bn_session', token, {
        httpOnly: true,
        secure: false, // In AI Studio dev container / iframe preview
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
        path: '/',
      });

      return res.json({
        ok: true,
        usuario: sanitizeUser(user),
      });
    } catch (err: any) {
      console.error('Error en /api/login:', err);
      return res.status(500).json({ error: 'Error interno del servidor al autenticar.' });
    }
  });

  // POST /api/logout: elimina la cookie
  app.post('/api/logout', (req: AuthenticatedRequest, res: Response) => {
    const token = req.cookies?.bn_session;
    if (token) {
      const session = verifySessionToken(token);
      if (session) {
        const users = getUsuarios();
        const user = users.find((u) => u.id === session.userId);
        if (user) {
          logAuditoria(user.id, user.usuario, 'logout', 'Sesión cerrada');
        }
      }
    }

    res.clearCookie('bn_session', { path: '/' });
    return res.json({ ok: true, mensaje: 'Sesión finalizada con éxito.' });
  });

  // GET /api/yo: devuelve el usuario conectado
  app.get('/api/yo', (req: AuthenticatedRequest, res: Response) => {
    const token = req.cookies?.bn_session;
    if (!token) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const session = verifySessionToken(token);
    if (!session) {
      res.clearCookie('bn_session', { path: '/' });
      return res.status(401).json({ error: 'Sesión inválida o expirada' });
    }

    const users = getUsuarios();
    const user = users.find((u) => u.id === session.userId);
    if (!user) {
      res.clearCookie('bn_session', { path: '/' });
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    if (user.estado === 'suspendido') {
      res.clearCookie('bn_session', { path: '/' });
      return res.status(403).json({ error: 'usuario suspendido, contacte al administrador' });
    }

    return res.json({
      ok: true,
      usuario: sanitizeUser(user),
    });
  });

  // POST /api/cambiar-clave: cambia la contraseña (mínimo 8 caracteres, al menos un número)
  app.post('/api/cambiar-clave', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { claveNueva } = req.body;
      const user = req.user!;

      if (!claveNueva || typeof claveNueva !== 'string') {
        return res.status(400).json({ error: 'Por favor introduce la nueva contraseña.' });
      }

      // Validar mínimo 8 caracteres y al menos un número
      if (claveNueva.length < 8) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener mínimo 8 caracteres.' });
      }

      if (!/\d/.test(claveNueva)) {
        return res.status(400).json({ error: 'La nueva contraseña debe contener al menos un número (0-9).' });
      }

      const users = getUsuarios();
      const currentUser = users.find((u) => u.id === user.id);
      if (!currentUser) {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }

      const salt = bcrypt.genSaltSync(10);
      currentUser.claveHash = bcrypt.hashSync(claveNueva, salt);
      currentUser.debeCambiarClave = false;
      saveUsuarios(users);

      logAuditoria(user.id, user.usuario, 'cambio_clave', 'Contraseña actualizada por el usuario');

      return res.json({
        ok: true,
        usuario: sanitizeUser(currentUser),
        mensaje: 'Contraseña actualizada con éxito.',
      });
    } catch (err: any) {
      console.error('Error en /api/cambiar-clave:', err);
      return res.status(500).json({ error: 'Error al cambiar la contraseña.' });
    }
  });

  // ==========================================
  // COMPARADOR ENDPOINTS (TODOS PROTEGIDOS CON requireAuth)
  // ==========================================

  // Helper endpoint to load sample PDFs
  app.get('/api/sample-proposals', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const samplesDir = path.join(__dirname, 'public', 'assets', 'aistudio');
      if (!fs.existsSync(samplesDir)) {
        return res.json({ samples: [] });
      }

      const files = [
        {
          id: 'propuesta-a',
          fileName: 'Propuesta_A_Aseguradora_Cordillera_45e2b828.pdf',
          displayName: 'Aseguradora Cordillera S.A. (Propuesta A)',
          url: '/assets/aistudio/Propuesta_A_Aseguradora_Cordillera_45e2b828.pdf',
        },
        {
          id: 'propuesta-b',
          fileName: 'Propuesta_B_Seguros_Alborada_26bdc3b0.pdf',
          displayName: 'Seguros Alborada (Propuesta B)',
          url: '/assets/aistudio/Propuesta_B_Seguros_Alborada_26bdc3b0.pdf',
        },
        {
          id: 'propuesta-c',
          fileName: 'Propuesta_C_Protectora_del_Valle_422f9421.pdf',
          displayName: 'Protectora del Valle (Propuesta C)',
          url: '/assets/aistudio/Propuesta_C_Protectora_del_Valle_422f9421.pdf',
        },
      ];

      const loadedSamples = [];
      for (const item of files) {
        const fullPath = path.join(samplesDir, item.fileName);
        if (fs.existsSync(fullPath)) {
          const buffer = fs.readFileSync(fullPath);
          loadedSamples.push({
            ...item,
            size: buffer.length,
            base64: buffer.toString('base64'),
          });
        }
      }

      res.json({ samples: loadedSamples });
    } catch (error: any) {
      console.error('Error reading sample proposals:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Profile extraction handler used by both /api/extract-profile and /api/extract-client-profile
  const handleExtractProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sourceType, text, pdfBase64, fileName } = req.body;

      if (sourceType === 'message' && (!text || typeof text !== 'string' || text.trim().length === 0)) {
        return res.status(400).json({ error: 'Por favor ingresa o pega el texto del mensaje del cliente.' });
      }

      if (sourceType === 'pdf' && !pdfBase64) {
        return res.status(400).json({ error: 'Por favor sube un archivo PDF con la solicitud o datos del cliente.' });
      }

      const promptSystem = `
Eres un analista de seguros de automóviles para "Banco del Coco" en Costa Rica.
Tu tarea es analizar el texto suministrado o el documento PDF y extraer con precisión los datos del perfil del cliente para cotización de póliza voluntaria de automóvil.

Debes extraer los siguientes campos:
1. "name": Nombre del cliente (si no se encuentra o es un documento genérico, dejar cadena vacía "").
2. "vehicle": Marca, modelo, año y uso del vehículo (ej. "Toyota Corolla XEi 2022 - Particular").
3. "maxBudget": Presupuesto máximo anual en colones costarricenses (entero numérico, ej. 400000). Si no está indicado, retornar 0.
4. "mandatoryCoverages": Objeto con valores booleanos (true/false) para cada una de estas 5 coberturas:
   - colision: si el cliente solicita cobertura contra colisión/vuelco/choque o seguro a todo riesgo / completo.
   - robo: si el cliente solicita cobertura por robo total/parcial.
   - asistenciaVial: si solicita asistencia vial 24/7, auxilio en carretera, grúa o cerrajería.
   - fenomenosNaturales: si solicita cobertura contra inundaciones, deslizamientos, sismos, desastres naturales o caída de árboles.
   - vehiculoSustituto: si solicita auto sustituto o vehículo provisional en caso de avería o accidente.
   (Nota: Si el cliente solicita "cobertura completa", "full coberturas" o "todo riesgo", marca todas en true).
5. "priorities": Resumen conciso (1 a 3 líneas) de las prioridades, preocupaciones o solicitudes específicas expresadas por el cliente.
6. "paymentMethod": Uno de los siguientes valores exactos:
   - "Anual de contado"
   - "Mensual (12 cuotas)"
   - "Semestral (2 cuotas)"
   - "Indiferente / El más conveniente"
`;

      const contentsParts: any[] = [];

      if (sourceType === 'pdf' && pdfBase64) {
        let cleanBase64 = pdfBase64;
        if (cleanBase64.includes('base64,')) {
          cleanBase64 = cleanBase64.split('base64,')[1];
        }
        contentsParts.push({
          inlineData: {
            mimeType: 'application/pdf',
            data: cleanBase64,
          },
        });
        contentsParts.push({
          text: `Documento adjunto: ${fileName || 'solicitud_cliente.pdf'}.\n\n${promptSystem}\nExtrae los campos del perfil del cliente a partir de este documento PDF.`,
        });
      } else {
        contentsParts.push({
          text: `${promptSystem}\n\n--- MENSAJE / NOTA DEL CLIENTE ---\n${text}\n\nExtrae los campos del perfil del cliente a partir de este mensaje.`,
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contentsParts,
        config: {
          systemInstruction: 'Eres un analista de aseguramiento técnico de Banco del Coco. Extrae datos estructurados con fidelidad a lo manifestado por el cliente.',
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              vehicle: { type: Type.STRING },
              maxBudget: { type: Type.NUMBER },
              mandatoryCoverages: {
                type: Type.OBJECT,
                properties: {
                  colision: { type: Type.BOOLEAN },
                  robo: { type: Type.BOOLEAN },
                  asistenciaVial: { type: Type.BOOLEAN },
                  fenomenosNaturales: { type: Type.BOOLEAN },
                  vehiculoSustituto: { type: Type.BOOLEAN },
                },
                required: ['colision', 'robo', 'asistenciaVial', 'fenomenosNaturales', 'vehiculoSustituto'],
              },
              priorities: { type: Type.STRING },
              paymentMethod: { type: Type.STRING },
            },
            required: ['name', 'vehicle', 'maxBudget', 'mandatoryCoverages', 'priorities', 'paymentMethod'],
          },
        },
      });

      const textOutput = response.text || '{}';
      const parsedProfile = JSON.parse(textOutput);

      return res.json({ profile: parsedProfile });
    } catch (err: any) {
      console.error('Error in extract-profile:', err);
      return res.status(500).json({ error: err.message || 'Error al extraer perfil del cliente.' });
    }
  };

  // Endpoint to extract client profile
  app.post('/api/extract-profile', requireAuth, handleExtractProfile);
  app.post('/api/extract-client-profile', requireAuth, handleExtractProfile);

  // Main comparison API
  app.post('/api/compare', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { files, clientProfile } = req.body;

      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: 'Se requiere al menos 1 archivo PDF de propuesta.' });
      }

      if (files.length > 3) {
        return res.status(400).json({ error: 'Máximo 3 propuestas permitidas simultáneamente.' });
      }

      if (!clientProfile) {
        return res.status(400).json({ error: 'Falta el perfil del cliente.' });
      }

      const mandatoryList: string[] = [];
      if (clientProfile.mandatoryCoverages?.colision) mandatoryList.push('Colisión');
      if (clientProfile.mandatoryCoverages?.robo) mandatoryList.push('Robo');
      if (clientProfile.mandatoryCoverages?.asistenciaVial) mandatoryList.push('Asistencia vial 24/7');
      if (clientProfile.mandatoryCoverages?.fenomenosNaturales) mandatoryList.push('Fenómenos naturales');
      if (clientProfile.mandatoryCoverages?.vehiculoSustituto) mandatoryList.push('Vehículo sustituto');

      const mandatoryListStr = mandatoryList.length > 0
        ? mandatoryList.join(', ')
        : 'Ninguna marcada expresamente';

      // Prepare Gemini parts
      const promptText = `
Eres un analista experto de seguros de automóviles en Costa Rica para "Banco del Coco".
Tu tarea es analizar meticulosamente cada uno de los documentos PDF de cotización adjuntos y compararlos según el perfil del cliente suministrado.

--- PERFIL DEL CLIENTE ---
- Nombre del cliente: ${clientProfile.name || 'Cliente'}
- Vehículo y uso: ${clientProfile.vehicle || 'Vehículo particular'}
- Presupuesto máximo anual: ₡ ${Number(clientProfile.maxBudget || 0).toLocaleString('es-CR')} colones
- Coberturas obligatorias solicitadas: ${mandatoryListStr}
- Prioridades del cliente: ${clientProfile.priorities || 'Ninguna especificada'}
- Forma de pago preferida: ${clientProfile.paymentMethod || 'Anual de contado'}

--- REGLAS ESTRICTAS DE EXTRACCIÓN Y LÓGICA (OBLIGATORIAS) ---
1. Extraer de cada PDF SOLO lo que dice el documento; si un dato no aparece, escribir "no indicado". NO inventar datos.
2. Validar:
   - CABE EN PRESUPUESTO: "Sí" si la prima anual es menor o igual al presupuesto del cliente (₡ ${Number(clientProfile.maxBudget || 0).toLocaleString('es-CR')}). "No" si la supera. Si la prima no está clara, "no indicado".
   - CUMPLE OBLIGATORIAS: "Sí" SOLO si TODAS las coberturas marcadas como obligatorias (${mandatoryListStr}) están incluidas en la prima base; un paquete opcional con costo adicional NO cuenta (por ejemplo, si la asistencia vial se ofrece como paquete opcional con recargo adicional y no viene incluida en la prima base, NO cumple). "No" si falta al menos una de las coberturas obligatorias.
3. Semáforo:
   - "verde" si cabe en presupuesto ("Sí") Y cumple obligatorias ("Sí").
   - "amarillo" si cumple obligatorias ("Sí") pero NO cabe en presupuesto ("No").
   - "rojo" si NO cumple obligatorias ("No"), sin importar el precio.
4. Recomendación preliminar (borrador):
   - Una sola propuesta recomendada, justificada en MÁXIMO 5 LÍNEAS con los montos exactos, según las prioridades del cliente.
   - Si una propuesta con semáforo amarillo es mejor para satisfacer las prioridades del cliente frente a las demás, recomendarla explícitamente y CUANTIFICAR con exactitud la diferencia de prima (cuánto excede el presupuesto y por qué vale la pena para el cliente).
5. Mensaje sugerido para el cliente (WhatsApp):
   - Formato listo para enviar por WhatsApp al cliente.
   - Máximo 8 líneas.
   - Tono cordial, empático, sin tecnicismos complejos.
   - Debe incluir la recomendación, dos razones clave, la alternativa y un próximo paso claro.
   - NUNCA prometer plazos ni fechas de entrega ficticias.

Adjunto encontrarás los documentos de las propuestas en el mismo orden:
${files.map((f: any, idx: number) => `Documento ${idx + 1}: ${f.name}`).join('\n')}

Debes responder ÚNICAMENTE en formato JSON con la siguiente estructura exacta:
{
  "proposals": [
    {
      "id": "proposal-1",
      "fileName": "Nombre del archivo",
      "insurerName": "Nombre de la aseguradora (ej. Aseguradora Cordillera S.A.)",
      "annualPremium": "Monto en colones con IVA (ej. ₡ 395.000)",
      "annualPremiumNumeric": 395000,
      "fitsBudget": "Sí" o "No" o "no indicado",
      "collisionDeductible": "Detalle del deducible de colisión (ej. 10% del reclamo, mín. ₡ 150.000)",
      "theftDeductible": "Detalle deducible robo (ej. 10% del valor asegurado)",
      "thirdPartyLiabilityProperty": "Límite RC daños a terceros (bienes) (ej. ₡ 50.000.000)",
      "thirdPartyLiabilityInjuries": "Límite RC lesiones o muerte (ej. ₡ 100.000.000)",
      "roadsideAssistance": "Detalle de asistencia vial 24/7 (ej. Incluida territorio nacional / No incluye avería / Opcional con costo)",
      "towing": "Detalle de grúa (ej. Hasta 50 km, máx 3 eventos/año / Ilimitado)",
      "replacementVehicle": "Detalle de vehículo sustituto (ej. No incluido / Hasta 10 días por evento)",
      "naturalPhenomena": "Cobertura de fenómenos naturales (ej. No aplica / Suma asegurada)",
      "glassBreakage": "Detalle de rotura de cristales (ej. ₡ 300.000 por evento / Sin límite sin deducible / No cubre)",
      "highlightedExclusions": "Exclusiones destacadas del documento",
      "meetsMandatory": "Sí" o "No" o "no indicado",
      "trafficLight": "verde" o "amarillo" o "rojo",
      "trafficLightExplanation": "Breve explicación del semáforo asignado"
    }
  ],
  "preliminaryRecommendation": "Texto de máximo 5 líneas con montos y justificación...",
  "whatsappMessage": "Texto para WhatsApp de máximo 8 líneas..."
}
`;

      const contentsParts: any[] = [];

      // Add each PDF as inlineData
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let base64Clean = file.base64;
        if (base64Clean.includes('base64,')) {
          base64Clean = base64Clean.split('base64,')[1];
        }

        contentsParts.push({
          inlineData: {
            mimeType: 'application/pdf',
            data: base64Clean,
          },
        });
        contentsParts.push({
          text: `El archivo anterior corresponde al Documento ${i + 1}: ${file.name}`,
        });
      }

      contentsParts.push({
        text: promptText,
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contentsParts,
        config: {
          systemInstruction: 'Eres un analista senior de seguros de la corredora Banco del Coco en Costa Rica. Tu misión es analizar pólizas de seguro de automóvil con rigurosidad matemática y contractual.',
          temperature: 0.1,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              proposals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    fileName: { type: Type.STRING },
                    insurerName: { type: Type.STRING },
                    annualPremium: { type: Type.STRING },
                    annualPremiumNumeric: { type: Type.NUMBER },
                    fitsBudget: { type: Type.STRING },
                    collisionDeductible: { type: Type.STRING },
                    theftDeductible: { type: Type.STRING },
                    thirdPartyLiabilityProperty: { type: Type.STRING },
                    thirdPartyLiabilityInjuries: { type: Type.STRING },
                    roadsideAssistance: { type: Type.STRING },
                    towing: { type: Type.STRING },
                    replacementVehicle: { type: Type.STRING },
                    naturalPhenomena: { type: Type.STRING },
                    glassBreakage: { type: Type.STRING },
                    highlightedExclusions: { type: Type.STRING },
                    meetsMandatory: { type: Type.STRING },
                    trafficLight: { type: Type.STRING },
                    trafficLightExplanation: { type: Type.STRING },
                  },
                  required: [
                    'fileName',
                    'insurerName',
                    'annualPremium',
                    'fitsBudget',
                    'collisionDeductible',
                    'theftDeductible',
                    'thirdPartyLiabilityProperty',
                    'thirdPartyLiabilityInjuries',
                    'roadsideAssistance',
                    'towing',
                    'replacementVehicle',
                    'naturalPhenomena',
                    'glassBreakage',
                    'highlightedExclusions',
                    'meetsMandatory',
                    'trafficLight',
                    'trafficLightExplanation',
                  ],
                },
              },
              preliminaryRecommendation: { type: Type.STRING },
              whatsappMessage: { type: Type.STRING },
            },
            required: ['proposals', 'preliminaryRecommendation', 'whatsappMessage'],
          },
        },
      });

      const textOutput = response.text || '{}';
      let parsedData;
      try {
        parsedData = JSON.parse(textOutput);
      } catch (parseErr) {
        console.error('Failed to parse Gemini JSON output:', textOutput);
        return res.status(500).json({
          error: 'Error procesando la respuesta del análisis de Gemini. Por favor intente de nuevo.',
          raw: textOutput,
        });
      }

      // Programmatic verification & hardening of rules
      if (parsedData.proposals && Array.isArray(parsedData.proposals)) {
        parsedData.proposals = parsedData.proposals.map((prop: any, idx: number) => {
          const originalFile = files[idx] || files[0];
          const fileName = prop.fileName || originalFile.name;
          const numericPremium = Number(prop.annualPremiumNumeric) || 0;
          const maxBudget = Number(clientProfile.maxBudget) || 0;

          // Double check fits budget if numeric values exist
          let fitsBudget = prop.fitsBudget;
          if (numericPremium > 0 && maxBudget > 0) {
            fitsBudget = numericPremium <= maxBudget ? 'Sí' : 'No';
          }

          // Ensure traffic light strictly follows rules:
          // verde: fits && meets
          // amarillo: !fits && meets
          // rojo: !meets
          let meetsMandatory = prop.meetsMandatory;
          let trafficLight = prop.trafficLight?.toLowerCase();

          if (meetsMandatory === 'Sí' && fitsBudget === 'Sí') {
            trafficLight = 'verde';
          } else if (meetsMandatory === 'Sí' && fitsBudget === 'No') {
            trafficLight = 'amarillo';
          } else if (meetsMandatory === 'No') {
            trafficLight = 'rojo';
          }

          return {
            ...prop,
            id: prop.id || `prop-${idx + 1}`,
            fileName,
            fitsBudget,
            meetsMandatory,
            trafficLight: trafficLight === 'verde' || trafficLight === 'amarillo' || trafficLight === 'rojo' ? trafficLight : 'amarillo',
          };
        });
      }

      // Save comparison record to data/comparaciones.json
      const compId = `comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      saveComparacion({
        id: compId,
        usuarioId: req.user?.id || 'desconocido',
        usuarioNombre: req.user?.nombre || req.user?.usuario || 'Asesor',
        fecha: new Date().toISOString(),
        cliente: clientProfile?.name || 'No indicado',
        vehiculo: clientProfile?.vehicle || 'No indicado',
        presupuesto: clientProfile?.maxBudget || 0,
        cantidadPropuestas: files.length,
        propuestas: parsedData.proposals?.map((p: any) => ({
          aseguradora: p.insurerName,
          prima: p.annualPremium,
          semaforo: p.trafficLight,
        })),
        recomendacionResumen: (parsedData.preliminaryRecommendation || '').substring(0, 250),
      });

      // Audit log
      logAuditoria(
        req.user?.id || 'anonimo',
        req.user?.usuario || 'anonimo',
        'comparacion_realizada',
        {
          comparacionId: compId,
          cliente: clientProfile?.name,
          vehiculo: clientProfile?.vehicle,
          cantidadPropuestas: files.length,
        }
      );

      return res.json(parsedData);
    } catch (err: any) {
      console.error('API /api/compare error:', err);
      return res.status(500).json({
        error: err.message || 'Ocurrió un error al procesar las propuestas.',
      });
    }
  });

  // Serve static files or setup Vite middlewares
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server started on http://0.0.0.0:${port}`);
  });
}

startServer();
