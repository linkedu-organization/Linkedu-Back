export type Filter = {
  campo: string;
  operador: string;
  valor: string | number | boolean | string[];
};

export type Sorter = {
  campo: string;
  ordem: 'ASC' | 'DESC';
};

export function buildWhereClause(filters: Filter[] = []) {
  const where: Record<string, any> = {};

  filters.forEach(({ campo, operador, valor }) => {
    const { parent, field } = getObjectPath(where, campo);

    switch (operador) {
      case 'like':
        parent[field].contains = valor;
        parent[field].mode = 'insensitive';
        break;
      case '>=':
        parent[field].gte = valor;
        break;
      case '<=':
        parent[field].lte = valor;
        break;
      case 'in':
        parent[field].in = valor;
        break;
      case 'hasSome':
        parent[field].hasSome = valor;
        break;
      default:
        parent[field] = valor;
    }
  });

  return where;
}

export function buildOrderClause(sorters: Sorter[] = []) {
  return sorters.map(sorter => ({
    [sorter.campo]: sorter.ordem.toLowerCase(),
  }));
}

function getObjectPath(where: Record<string, any>, campo: string) {
  const path = campo.split('.');
  let current = where;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i] as string;

    if (!current[key]) {
      current[key] = {};
    }
    current = current[key];
  }

  const field = path[path.length - 1] as string;

  if (!current[field]) {
    current[field] = {};
  }

  return { parent: current, field };
}
