# BIATHLOG – Analýza biatlonových terčů

Aplikace pro analýzu biatlonových terčů pomocí AI (Claude Vision).

## Rychlé spuštění

### 1. Nainstalujte Node.js
Stáhněte z https://nodejs.org (verze 18 nebo novější)

### 2. Získejte Anthropic API klíč
1. Jděte na https://console.anthropic.com
2. Vytvořte účet a vygenerujte API klíč
3. Na klíč budete potřebovat kredit (~$5 stačí na stovky analýz)

### 3. Nastavte API klíč
```bash
# Zkopírujte vzorový soubor
cp .env.local.example .env.local

# Otevřete .env.local v editoru a nahraďte 'váš_api_klíč_zde' vaším skutečným klíčem
```

Soubor `.env.local` musí vypadat takto:
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxx
```

### 4. Spusťte aplikaci
```bash
# Nainstalujte závislosti (jen poprvé)
npm install

# Spusťte vývojový server
npm run dev
```

### 5. Otevřete v prohlížeči
Jděte na http://localhost:3000

---

## Použití

1. **Nový terč** → vyberte datum tréninku (středa), napište poznámku
2. **Vyberte typ střelby** → Ležka nebo Stojka
3. **Nahrajte fotku** terče
4. **Analyzovat pomocí AI** → Claude Vision analyzuje terč podle pravidel biatlonu
5. Pokud výsledek není přesný, klikněte **Opravit výsledek**
6. **Přidat do tréninku** → opakujte pro všechny terče
7. **Uložit trénink**

## Pravidla analýzy

### Ležka (přísná)
- Trefená = rána **pouze v malém vnitřním kruhu**
- Netrefená = rána ve velkém kruhu mimo střed, nebo mimo terč

### Stojka (benevolentní)
- Trefená = rána **kdekoliv v tmavém kruhu** (velký i malý)
- Netrefená = rána mimo terč na bílém papíru

## Technologie

- **Next.js 14** – React framework
- **TypeScript** – typová bezpečnost
- **Anthropic Claude claude-opus-4-5** – analýza obrázků pomocí Vision API
- **localStorage** – lokální ukládání dat (bez cloudu, bez přihlášení)
