export interface AppStateQuery {
  profileId?: string;
  selectedIds?: string[];
  dimTag?: string;
}

export function toQueryString(state: AppStateQuery): string {
  const params = new URLSearchParams();
  if (state.profileId) params.set('p', state.profileId);
  if (state.dimTag) params.set('tag', state.dimTag);
  if (state.selectedIds && state.selectedIds.length) params.set('sel', state.selectedIds.join(','));
  const s = params.toString();
  return s ? `?${s}` : '';
}

export function fromQueryString(search: string): AppStateQuery {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  const p = params.get('p') || undefined;
  const tag = params.get('tag') || undefined;
  const sel = params.get('sel');
  const selectedIds = sel ? sel.split(',').filter(Boolean) : undefined;
  return { profileId: p, dimTag: tag, selectedIds };
}
