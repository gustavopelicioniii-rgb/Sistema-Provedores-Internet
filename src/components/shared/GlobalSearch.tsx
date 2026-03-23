import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Users, DollarSign, Headphones, Wifi, FileText, Zap } from 'lucide-react';
import { mockClients, mockTickets, mockInvoices, mockEquipments, mockPlans } from '@/data/mockData';

type SearchResult = {
  id: string;
  label: string;
  sublabel: string;
  type: 'client' | 'ticket' | 'invoice' | 'equipment' | 'plan';
  url: string;
};

const typeIcons = {
  client: Users,
  ticket: Headphones,
  invoice: DollarSign,
  equipment: Wifi,
  plan: FileText,
};

const typeLabels = {
  client: 'Cliente',
  ticket: 'Ticket',
  invoice: 'Fatura',
  equipment: 'Equipamento',
  plan: 'Plano',
};

function searchAll(query: string): SearchResult[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  mockClients.forEach((c) => {
    if (
      c.name.toLowerCase().includes(q) ||
      c.document.includes(q) ||
      c.phone.includes(q) ||
      c.email.toLowerCase().includes(q)
    ) {
      results.push({
        id: c.id,
        label: c.name,
        sublabel: `${c.document} • ${c.plan} • ${c.city}`,
        type: 'client',
        url: `/clients/${c.id}`,
      });
    }
  });

  mockTickets.forEach((t) => {
    if (
      t.id.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.client.toLowerCase().includes(q)
    ) {
      results.push({
        id: t.id,
        label: `${t.id} — ${t.subject}`,
        sublabel: `${t.client} • ${t.status}`,
        type: 'ticket',
        url: '/tickets',
      });
    }
  });

  mockInvoices.forEach((inv) => {
    if (inv.id.toLowerCase().includes(q) || inv.client.toLowerCase().includes(q)) {
      results.push({
        id: inv.id,
        label: `${inv.id} — R$ ${inv.amount.toFixed(2)}`,
        sublabel: `${inv.client} • ${inv.status}`,
        type: 'invoice',
        url: '/finance',
      });
    }
  });

  mockEquipments.forEach((eq) => {
    if (eq.name.toLowerCase().includes(q) || eq.ip.includes(q)) {
      results.push({
        id: eq.id,
        label: eq.name,
        sublabel: `${eq.ip} • ${eq.clients} clientes • ${eq.status}`,
        type: 'equipment',
        url: '/network',
      });
    }
  });

  mockPlans.forEach((p) => {
    if (p.name.toLowerCase().includes(q)) {
      results.push({
        id: p.id,
        label: p.name,
        sublabel: `${p.downloadSpeed}/${p.uploadSpeed} Mbps • R$ ${p.price.toFixed(2)}`,
        type: 'plan',
        url: '/plans',
      });
    }
  });

  return results.slice(0, 12);
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const results = searchAll(query);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        navigate('/tickets');
      }
    },
    [navigate]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setQuery('');
    navigate(result.url);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative hidden md:flex items-center gap-2 h-9 w-72 px-3 text-sm text-muted-foreground transition-colors hover:bg-accent/60"
        style={{ background: 'rgba(0,0,0,0.03)', borderRadius: 10 }}
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Buscar...</span>
        <kbd className="hidden lg:inline-flex h-5 items-center gap-0.5 rounded border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setQuery('');
            setSelectedIndex(0);
          }
        }}
      >
        <DialogContent
          className="glass-card p-0 max-w-lg border-none gap-0 overflow-hidden"
          style={{ borderRadius: 16 }}
        >
          <div
            className="flex items-center gap-3 px-4 border-b"
            style={{ borderColor: 'rgba(0,0,0,0.06)' }}
          >
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Buscar clientes, tickets, faturas, OLTs, planos..."
              className="border-none shadow-none focus-visible:ring-0 h-12 text-sm"
              autoFocus
            />
          </div>
          <div className="max-h-80 overflow-y-auto p-2">
            {query.length < 2 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Digite pelo menos 2 caracteres para buscar
                </p>
                <div className="flex justify-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px]">↑↓</kbd>{' '}
                    navegar
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px]">↵</kbd>{' '}
                    selecionar
                  </span>
                  <span>
                    <kbd className="px-1.5 py-0.5 rounded border bg-muted text-[10px]">esc</kbd>{' '}
                    fechar
                  </span>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Nenhum resultado para "{query}"</p>
              </div>
            ) : (
              <>
                {results.map((r, i) => {
                  const Icon = typeIcons[r.type];
                  return (
                    <button
                      key={`${r.type}-${r.id}`}
                      onClick={() => handleSelect(r)}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        i === selectedIndex ? 'bg-primary/10' : 'hover:bg-accent/60'
                      }`}
                    >
                      <div
                        className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(59,130,246,0.1)' }}
                      >
                        <Icon className="h-4 w-4" style={{ color: '#2563EB' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{r.sublabel}</p>
                      </div>
                      <span
                        className="text-[10px] text-muted-foreground font-medium px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(0,0,0,0.04)' }}
                      >
                        {typeLabels[r.type]}
                      </span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
