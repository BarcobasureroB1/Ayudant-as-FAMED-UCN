import React, { SyntheticEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/context/AuthContext';
//import { useAsignaturas } from '@/hooks/useAsignaturas';
//import { useDepartamentos } from '@/hooks/useDepartamentos';
//import { useLlamados } from '@/hooks/useLlamados';
//import { useAyudantia } from '@/hooks/useAyudantia';
//