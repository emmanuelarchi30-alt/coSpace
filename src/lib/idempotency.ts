import prisma from '@/lib/prisma';

export interface IdempotencyResult<T> {
  isCached: boolean;
  statusCode: number;
  data: T;
}

/**
 * Consulta si existe una respuesta idempotente previamente almacenada y vigente.
 * @param key Clave única de idempotencia enviada por el cliente.
 * @param route Ruta del endpoint evaluado.
 * @param userId Identificador del usuario autenticado (opcional).
 */
export async function checkIdempotency<T>(
  key: string,
  route: string,
  userId?: string
): Promise<IdempotencyResult<T> | null> {
  try {
    const record = await prisma.idempotencyKey.findUnique({
      where: { key },
    });

    if (!record) {
      return null;
    }

    // Si la clave ya expiró, se ignora para permitir nuevo procesamiento
    if (new Date() > record.expiresAt) {
      return null;
    }

    // Validar coincidencia de ruta y usuario para evitar colisiones entre usuarios
    if (record.route !== route) {
      return null;
    }

    if (userId && record.userId && record.userId !== userId) {
      return null;
    }

    return {
      isCached: true,
      statusCode: record.statusCode,
      data: record.response as unknown as T,
    };
  } catch (error) {
    // Si la base de datos presenta algún inconveniente al consultar la clave, se continúa sin bloquear
    console.warn('Advertencia al consultar clave de idempotencia:', error);
    return null;
  }
}

/**
 * Registra el resultado de una operación exitosa vinculada a una clave de idempotencia.
 * @param key Clave única de idempotencia enviada por el cliente.
 * @param route Ruta del endpoint evaluado.
 * @param statusCode Código de estado HTTP retornado.
 * @param response Cuerpo de respuesta a almacenar en formato serializable.
 * @param userId Identificador del usuario autenticado.
 * @param requestPayload Resumen o cuerpo de la solicitud recibida.
 * @param ttlHours Tiempo de vida de la clave en horas (por defecto 24 horas).
 */
export async function saveIdempotencyRecord(
  key: string,
  route: string,
  statusCode: number,
  response: unknown,
  userId?: string,
  requestPayload?: unknown,
  ttlHours: number = 24
): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
    const requestHash = requestPayload ? JSON.stringify(requestPayload) : null;

    await prisma.idempotencyKey.upsert({
      where: { key },
      update: {
        statusCode,
        response: response as object,
        expiresAt,
        requestHash,
      },
      create: {
        key,
        userId: userId ?? null,
        route,
        statusCode,
        response: response as object,
        requestHash,
        expiresAt,
      },
    });
  } catch (error) {
    console.warn('Advertencia al guardar registro de idempotencia:', error);
  }
}
