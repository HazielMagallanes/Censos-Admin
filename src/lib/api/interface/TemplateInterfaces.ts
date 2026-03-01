export interface CreateAttribute {
  nombre: string;
  descripcion?: string;
  recomendaciones?: string;
  id_tipo: number;
  obligatorio?: boolean;
  duplicable?: boolean;
  orden?: number;
}

export interface CreateCategory {
  nombre: string;
  descripcion?: string;
  atributos: CreateAttribute[];
}

export interface CreateTemplate {
  nombre: string;
  descripcion?: string;
  es_copia_de?: number | null;
  id_municipio?: number | null;
  categorias: CreateCategory[];
}
