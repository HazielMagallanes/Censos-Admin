import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/shadcn/button';
import { ChevronDown, Loader2 } from 'lucide-react';
import Bell from '@/assets/SCF_Icons/bell.svg?react';
import HelpCircle from '@/assets/SCF_Icons/message_circle_question_mark.svg?react';
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
        {/* There's a inheritance problem in here not allowing me to change the svg sizes */}
        <Button variant="ghost" size="icon" className="h-10 w-10 bg-sky-600 text-white hover:bg-sky-700">
          <HelpCircle width={90} height={90} />
        </Button>
        <Button variant="ghost" className="h-10 w-10 bg-sky-600 text-white hover:bg-sky-700">
          <Bell width={100} height={100} />
        </Button>

        {/* SELECTOR DE ROL */}
        <div className="relative flex items-center gap-2 rounded-md border bg-white p-1 px-3 h-10 min-w-[140px] justify-between group hover:border-sky-300 transition-colors cursor-pointer">
          {loadingRoles ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          ) : (
            <>
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
                <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">{activeRole?.rol.nombre || 'Sin Rol'}</span>
              </div>

              <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-sky-600" />
            </>
          )}
        </div>

        {/* INFO DE USUARIO */}
        <div className="flex items-center gap-2 rounded-md border bg-white p-1 px-3 h-10">
          <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">{userName}</span>
          <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-sky-600" />
        </div>
      </div>
    </header>
  );
}
