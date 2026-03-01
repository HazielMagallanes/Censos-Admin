import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/shadcn/button';
import { HelpCircle, Bell, ChevronDown, Loader2 } from 'lucide-react';
import { useRole } from '@/components/providers/RoleProvider';
import { useAuth } from '@/components/providers/AuthProvider';

export function DashboardHeader() {
  const [userName, setUserName] = useState<string>('Cargando...');
  const { activeRole, userRoles, setActiveRole, isLoading: loadingRoles } = useRole();

  // 1. Obtener nombre de usuario
  useEffect(() => {
    const fetchName = async () => {
      try {
        const { data } = await axios.get('/me/name');
        if (data) setUserName(`${data.name} ${data.lastName}`);
      } catch (error) {
        console.error('Error fetching name:', error);
        setUserName('Usuario');
      }
    };
    fetchName();
  }, []);

  // Manejador del cambio de rol
  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = Number(event.target.value);
    const selectedRole = userRoles.find(r => r.id_rol === roleId);
    if (selectedRole) {
      setActiveRole(selectedRole);
    }
  };

  if (!useAuth().token) return;
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">S.C.F</h1>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="bg-sky-600 text-white hover:bg-sky-700">
          <HelpCircle className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="bg-sky-600 text-white hover:bg-sky-700">
          <Bell className="h-5 w-5" />
        </Button>

        {/* SELECTOR DE ROL */}
        <div className="relative flex items-center gap-2 rounded-md border bg-white p-1 px-3 min-w-[140px] justify-between group hover:border-sky-300 transition-colors cursor-pointer">
          {loadingRoles ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : (
            <>
              {/* Select nativo invisible superpuesto para funcionalidad robusta */}
              <select
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                value={activeRole?.id_rol || ''}
                onChange={handleRoleChange}
                disabled={userRoles.length <= 1}
              >
                {userRoles.map(ur => (
                  <option key={ur.id_rol} value={ur.id_rol}>
                    {ur.rol.nombre}
                  </option>
                ))}
              </select>

              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 leading-none uppercase tracking-wider font-bold">Rol Actual</span>
                <span className="text-sm font-medium text-sky-700 truncate max-w-[120px]">{activeRole?.rol.nombre || 'Sin Rol'}</span>
              </div>

              {userRoles.length > 1 && <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-sky-600" />}
            </>
          )}
        </div>

        {/* INFO DE USUARIO */}
        <div className="flex items-center gap-2 rounded-md border bg-white p-1 px-3">
          <span className="text-sm font-medium text-slate-700">{userName}</span>
        </div>
      </div>
    </header>
  );
}
