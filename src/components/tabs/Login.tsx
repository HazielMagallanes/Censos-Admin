import { GalleryVerticalEnd } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router" // Nota: en v6 es 'react-router-dom', verifica tu import
import { useState } from "react"
import axios from 'axios'
import { useAuth } from "../providers/AuthProvider"
import { useGoogleLogin } from "@react-oauth/google"

export function Login({
    className,
    ...props
  }: React.ComponentProps<"div">) {

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setToken } = useAuth()
  const navigate = useNavigate();

  // Configuración del login de Google
  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post('/auth/login', { 
            access_token: tokenResponse.access_token
        });

        if (!response) throw new Error("Respuesta del servidor inválida"); 

        setToken(response.data.token);
        navigate("/", { replace: true });
      } catch (err) {
        console.error(err);
        setError(
            axios.isAxiosError(err) 
            ? err.response?.data?.message || "Error al autenticar con el servidor."
            : "No se pudo iniciar sesión con Google."
        );
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
        setError("Falló la conexión con Google. Inténtalo de nuevo.");
        setLoading(false);
    }
  });

  return (
    <div className="min-h-screen min-w-screen flex justify-center items-center">
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        
        {/* Manejo de errores visual */}
        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-6 p-2">
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Censo de Arbolado</span>
            </div>
            
            <h1 className="text-xl font-bold text-center">¡Bienvenido de nuevo!</h1>
            
            <div className="flex min-w-full justify-center">
              {/* Botón personalizado que activa el hook de Google */}
              <Button 
                variant="default" 
                type="button" 
                className="w-full gap-2"
                onClick={() => loginWithGoogle()}
                disabled={loading}
              >
                  {loading ? (
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  ) : (
                    <>
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                    </svg>
                    Continuar con Google
                    </>
                  )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}