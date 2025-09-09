import { GalleryVerticalEnd } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from "react-router"
import { useState } from "react"
import axios from 'axios'



export function Login({
    className,
    ...props
  }: React.ComponentProps<"div">) {

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const validate = async () => {
    if (!email) return "Por favor, ingrese la dirección de correo electrónico.";
    // super simple email regex
    const re = /.+@.+\..+/;
    if (!re.test(email)) return "Por favor, ingrese una dirección de correo electrónico valida.";
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const v = await validate();
    if (v) return setError(v);

    setLoading(true);
    try {
			const response = await axios.post('http://172.19.214.85:3000/auth/login', { correo_electronico: email })
			if (response) navigate("/");
    } catch (error) {
      setError(axios.isAxiosError(error) ? error.response?.data.message : "No se pudo establecer la conexión con el servidor.");
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="min-h-screen min-w-screen flex justify-center items-center">
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded">{error}</div>
      )}
      {success && (
        <div className="mb-4 text-sm text-green-800 bg-green-50 border border-green-100 p-3 rounded">{success}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6 p-2">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Censo de Arbolado</span>
            </a>
            <h1 className="text-xl font-bold text-center">¡Bienvenido de nuevo!</h1>
            <div className="text-center text-sm">
              ¿No tienes una cuenta?{" "}
              <a href="#" className="underline underline-offset-4">
                Registrarse
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tú@ejemplo.com"
                formNoValidate
                onChange={(event) => {setEmail(event.target.value)}}
              />
            </div>
            <Button type="submit" className="w-full">
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
                <>Iniciar Sesión</>
              )}
            </Button>
          </div>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              O
            </span>
          </div>
          <div className="flex min-w-full justify-center">
            <Button variant="default" type="button" className="w-full">
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                  />
                  </svg>
                  Continuar con Google
                  </>
                )}
            </Button>
          </div>
        </div>
      </form>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Al clickear continuar, estas aceptando nuestros <a href="#">Terminos de servicio</a>{" "}
        y <a href="#">Política de privacidad</a>.
      </div>
    </div>
    </div>
  )
}
