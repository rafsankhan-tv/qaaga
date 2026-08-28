import { NextRequest } from 'next/server';
import { DoctorQuerySchema } from '@/lib/validation';
import { checkBruteForce, handleSecureApiError } from '@/lib/auth-security';
import { createApiSuccess, createApiError, handleOptionsCors } from '@/lib/api-response';
import { catalogService } from '@/services/business/catalog.service';

export async function OPTIONS() {
  return handleOptionsCors();
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'ip_doctors';
    const rateCheck = checkBruteForce(`doctors_get_${ip}`, 120, 60 * 1000);
    if (!rateCheck.allowed) {
      return createApiError('অতিরিক্ত রিকোয়েস্ট এসেছে। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।', {
        status: 429,
        extraMeta: { retryAfterSeconds: rateCheck.retryAfterSeconds },
      });
    }

    const { searchParams } = new URL(req.url);
    const rawQuery = {
      id: searchParams.get('id') || undefined,
      specialty: searchParams.get('specialty') || undefined,
      district: searchParams.get('district') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const queryResult = DoctorQuerySchema.safeParse(rawQuery);
    if (!queryResult.success) {
      return createApiError('Invalid query parameters', { status: 400 });
    }

    const { id, specialty, district, search } = queryResult.data;

    if (id) {
      const doctor = catalogService.getDoctorById(id);
      if (!doctor) {
        return createApiError('ডাক্তারের তথ্য পাওয়া যায়নি।', { status: 404 });
      }
      return createApiSuccess({ doctor });
    }

    const doctors = catalogService.getDoctors({ specialty, district, search });
    return createApiSuccess({
      doctors,
      total: doctors.length,
    });
  } catch (error: any) {
    return handleSecureApiError(error, 'Doctors catalog transport layer');
  }
}

