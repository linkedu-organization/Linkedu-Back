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
    switch (operador) {
      case 'like':
        where[campo].contains = valor;
        where[campo].mode = 'insensitive';
        break;
      case '>=':
        where[campo].gte = valor;
        break;
      case '<=':
        where[campo].lte = valor;
        break;
      case 'in':
        where[campo].in = valor;
        break;
      case 'hasSome':
        where[campo].hasSome = valor;
        break;
      default:
        where[campo] = valor;
    }
  });

  return where;
}

export function buildOrderClause(sorters: Sorter[] = []) {
  return sorters.map(sorter => ({
    [sorter.campo]: sorter.ordem.toLowerCase(),
  }));
}
