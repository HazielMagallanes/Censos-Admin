import axios from 'axios';
import React, { useEffect, useState } from 'react';

// --- Interfaces (kept from original file) ---
interface Attribute {
  nombre: string;
  descripcion: string;
  recomendaciones: string;
  duplicable: boolean;
  obligatorio: boolean;
  id_categoria: number;
  id_tipo: number;
}

interface categories {
  nombre: string;
  descripcion: string;
}

interface census {
  nombre: string;
  descripcion: string;
  anio: number;
  id_plantilla: number;
  id_municipio: number;
  id_tipo_censo: number;
}

interface censusType {
  nombre: string;
}

interface municipalities {
  nombre: string;
  descripcion: string;
  nombre_region: string;
  id_departamento: number;
}

interface province {
  nombre: string;
  provincia: string;
}

interface template {
  nombre: string;
  descripcion: string;
  es_copia_de: number | null;
  id_municipio: number;
}

interface types {
  nombre: string;
}

interface roles {
  id_rol: number;
  preferido: boolean;
}

interface users {
  nombre: string;
  apellido: string;
  correo_electronico: string;
  roles: roles[];
}

// --- Generic typed CRUD hook ---
type UseCrudReturn<T, F> = {
  items: T[];
  formData: F;
  setFormData: (f: F) => void;
  isEditing: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleEdit: (item: T) => void;
  deleteItemById: (id: number) => Promise<void>;
  resetForm: () => void;
  fetchItem: (id: number) => Promise<T[]>;
};

function useCrud<T extends Record<string, any>, F extends Record<string, any>>(
  baseUrl: string,
  initialForm: F
): UseCrudReturn<T, F> {
  const [items, setItems] = useState<T[]>([]);
  const [formData, setFormData] = useState<F>(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const normalizeToArray = (data: any): T[] => {
    if (Array.isArray(data)) return data as T[];
    if (data == null) return [];
    // If server wraps results in a `data` or similar property
    if (typeof data === 'object') {
      // prefer direct array properties if present
      const arrProp = Object.values(data).find((v) => Array.isArray(v));
      if (arrProp) return arrProp as T[];
      // otherwise treat the object itself as a single item
      return [data as T];
    }
    return [];
  };

  const fetchItems = async () => {
    try {
      const res = await axios.get(baseUrl);
      setItems(normalizeToArray(res.data));
    } catch (err) {
      console.error(`Error fetching ${baseUrl}:`, err);
    }
  };

    const fetchItem = async (id: number): Promise<T[]> => {
      try {
        const res = await axios.get(`${baseUrl}/${id}`);
        const arr = normalizeToArray(res.data);
        // return the found item(s) without overwriting the full items list
        return arr;
      } catch (err) {
        console.error(`Error fetching ${baseUrl}/${id}:`, err);
        return [];
      }
    };


  const createItem = async () => {
    try {
      const res = await axios.post(baseUrl, formData);
      const newItems = normalizeToArray(res.data);
      // if server returned an array, append all; otherwise append single
      setItems((prev) => [...prev, ...newItems]);
    } catch (err) {
      console.error(`Error creating ${baseUrl}:`, err);
    }
  };

  const updateItem = async (id: number) => {
    try {
      const res = await axios.put(`${baseUrl}/${id}`, formData);
      const updated = res.data;
      setItems((prev) => {
        // if server returned an array, try to merge by id; else replace single
        const updatedArr = normalizeToArray(updated);
        if (updatedArr.length === 1) {
          return prev.map((it) => {
            const itId = (it as any).id ?? (it as any).id_rol ?? (it as any).id_plantilla ?? (it as any).id_municipio;
            const updId = (updatedArr[0] as any).id ?? (updatedArr[0] as any).id_rol ?? (updatedArr[0] as any).id_plantilla ?? (updatedArr[0] as any).id_municipio;
            return itId === updId ? (updatedArr[0] as any) : it;
          });
        }
        // if it's an array, try to replace items with same ids and append new ones
        const mapById = new Map<any, any>();
        updatedArr.forEach((u) => {
          const uid = (u as any).id ?? (u as any).id_rol ?? (u as any).id_plantilla ?? (u as any).id_municipio;
          mapById.set(uid, u);
        });
        const merged = prev.map((it) => {
          const itId = (it as any).id ?? (it as any).id_rol ?? (it as any).id_plantilla ?? (it as any).id_municipio;
          return mapById.has(itId) ? mapById.get(itId) : it;
        });
        // append any new ones (whose id wasn't present)
        updatedArr.forEach((u) => {
          const uid = (u as any).id ?? (u as any).id_rol ?? (u as any).id_plantilla ?? (u as any).id_municipio;
          if (!merged.some((m) => ((m as any).id ?? (m as any).id_rol ?? (m as any).id_plantilla ?? (m as any).id_municipio) === uid)) merged.push(u);
        });
        return merged;
      });
    } catch (err) {
      console.error(`Error updating ${baseUrl}/${id}:`, err);
    }
  };

  const deleteItemById = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este elemento?')) return;
    try {
      await axios.delete(`${baseUrl}/${id}`);
      setItems((prev) => prev.filter((it) => ((it as any).id ?? (it as any).id_rol) !== id));
    } catch (err) {
      console.error(`Error deleting ${baseUrl}/${id}:`, err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && currentId != null) {
      await updateItem(currentId);
    } else {
      await createItem();
    }
    resetForm();
  };

  const handleEdit = (item: T) => {
    setIsEditing(true);
    // try to infer id from common fields
    const id = (item as any).id ?? (item as any).id_rol ?? (item as any).id_plantilla ?? (item as any).id_municipio ?? null;
    setCurrentId(typeof id === 'number' ? id : null);
    // We cast because many of the interfaces share similar shapes.
    setFormData(item as unknown as F);
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData(initialForm);
  };

  return { items, formData, setFormData, isEditing, handleSubmit, handleEdit, deleteItemById, resetForm, fetchItem };
}
const CRUDpage: React.FC = () => {
  // Create a CRUD instance for each interface using simple JSON textarea forms for now.
  const attributes = useCrud<Attribute, Attribute>('/attributes', {
    nombre: '',
    descripcion: '',
    recomendaciones: '',
    duplicable: false,
    obligatorio: false,
    id_categoria: 0,
    id_tipo: 0,
  });

  const categoriesCrud = useCrud<categories, categories>('/categories', { nombre: '', descripcion: '' });

  const censusCrud = useCrud<census, census>('/census', {
    nombre: '',
    descripcion: '',
    anio: new Date().getFullYear(),
    id_plantilla: 0,
    id_municipio: 0,
    id_tipo_censo: 0,
  });

  const censusTypes = useCrud<censusType, censusType>('/census-types', { nombre: '' });

  const municipalitiesCrud = useCrud<municipalities, municipalities>('/municipalities', {
    nombre: '',
    descripcion: '',
    nombre_region: '',
    id_departamento: 0,
  });

  const provinces = useCrud<province, province>('/provinces', { nombre: '', provincia: '' });

  const templatesCrud = useCrud<template, template>('/templates', {
    nombre: '',
    descripcion: '',
    es_copia_de: null,
    id_municipio: 0,
  });

  const typesCrud = useCrud<types, types>('/types', { nombre: '' });

  const rolesCrud = useCrud<roles, roles>('/roles', { id_rol: 0, preferido: false });

  const usersCrud = useCrud<users, users>('/users', { nombre: '', apellido: '', correo_electronico: '', roles: [] });

  const sections: Array<{ title: string; crud: UseCrudReturn<any, any> }> = [
    { title: 'Attributes', crud: attributes },
    { title: 'Categories', crud: categoriesCrud },
    { title: 'Census', crud: censusCrud },
    { title: 'Census Types', crud: censusTypes },
    { title: 'Municipalities', crud: municipalitiesCrud },
    { title: 'Provinces', crud: provinces },
    { title: 'Templates', crud: templatesCrud },
    { title: 'Types', crud: typesCrud },
    { title: 'Roles', crud: rolesCrud },
    { title: 'Users', crud: usersCrud },
  ];

  // New state for "fetch by id" section
  const [selectedSection, setSelectedSection] = useState<number>(0);
  const [fetchId, setFetchId] = useState<string>('');
  const [lastFetched, setLastFetched] = useState<any[]>([]);

  // Helper to display item key
  const itemKey = (item: any, idx: number) => item.id ?? item.id_rol ?? item.id_plantilla ?? item.correo_electronico ?? idx;

  // Handler to fetch an item by id using the selected CRUD's fetchItem
  const handleFetchById = async () => {
    const idNum = Number(fetchId);
    if (!Number.isInteger(idNum) || idNum < 0) {
      alert('Ingrese un id numérico válido');
      return;
    }
    const crud = sections[selectedSection].crud;
    // fetchItem now returns the found item(s) as an array without mutating the CRUD list
    const result = await crud.fetchItem(idNum);
    setLastFetched(result ?? []);
  };

  return (
    <div>
      <h1>Aplicación CRUD (Typed per interface)</h1>

      {/* New: Fetch item by ID section */}
      <section style={{ border: '1px dashed #bbb', padding: 12, margin: '12px 0' }}>
        <h2>Fetch item by ID</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label>
            Sección:
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(Number(e.target.value))}
              style={{ marginLeft: 8 }}
            >
              {sections.map((s, i) => (
                <option key={s.title} value={i}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            ID:
            <input
              type="number"
              value={fetchId}
              onChange={(e) => setFetchId(e.target.value)}
              style={{ marginLeft: 8, width: 120 }}
            />
          </label>

          <button onClick={handleFetchById}>Fetch</button>
        </div>

        <div style={{ marginTop: 12 }}>
          <strong>Resultado:</strong>
          <pre style={{ background: '#f7f7f7', padding: 8 }}>{JSON.stringify(lastFetched, null, 2)}</pre>
        </div>
      </section>

      {sections.map(({ title, crud }) => (
        <section key={title} style={{ border: '1px solid #ddd', padding: 12, margin: '12px 0' }}>
          <h2>{title}</h2>
          <form onSubmit={crud.handleSubmit}>
            <p style={{ margin: '6px 0' }}>{crud.isEditing ? 'Editar' : 'Crear'} {title}</p>
            <textarea
              aria-label={`${title} JSON form`}
              rows={6}
              style={{ width: '100%', fontFamily: 'monospace' }}
              value={JSON.stringify(crud.formData, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  crud.setFormData(parsed);
                } catch (err) {
                  // ignore parse errors while typing
                }
              }}
            />
            <div style={{ marginTop: 8 }}>
              <button type="submit">{crud.isEditing ? 'Actualizar' : 'Crear'}</button>
              {crud.isEditing && (
                <button type="button" onClick={crud.resetForm} style={{ marginLeft: 8 }}>
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <h3 style={{ marginTop: 12 }}>Lista de {title}</h3>
          <ul>
            {crud.items.map((item: any, idx: number) => (
              <li key={String(itemKey(item, idx))} style={{ marginBottom: 6 }}>
                <pre style={{ display: 'inline-block', margin: 0 }}>{JSON.stringify(item, null, 2)}</pre>
                <div>
                  <button onClick={() => crud.handleEdit(item)}>Editar</button>
                  <button
                    onClick={() => {
                      const id = item.id ?? item.id_rol ?? item.id_plantilla ?? item.id_municipio ?? null;
                      if (typeof id === 'number') crud.deleteItemById(id);
                      else {
                        // fallback: try to delete by index-like key (not ideal but safe)
                        console.warn('Could not determine numeric id for delete, skipping');
                      }
                    }}
                    style={{ marginLeft: 8 }}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

    </div>
  );
};

export default CRUDpage;