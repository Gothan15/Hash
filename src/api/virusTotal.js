export async function fetchFileInfo(hash, include = '') {
    const query = include ? `?include=${include}` : '';
    const res = await fetch(
      `http://localhost:4000/api/file-info/${hash}${query}`
    );
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || 'Error al obtener informe');
    }
    return res.json();
  }