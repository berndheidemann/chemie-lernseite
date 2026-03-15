/**
 * quiz-data.js – Alle 33 Quiz-Fragen (3 pro Thema)
 * Format: { topic, question, options: [{text, correct, explanation}] }
 */

export const QUIZ_DATA = [
  // ─── TOPIC 1: Atom, Ion, Kation, Anion ───
  {
    topic: 1,
    question: "Ein Natrium-Atom (Na) gibt ein Elektron ab. Was entsteht?",
    options: [
      { text: "Ein Na⁻-Anion", correct: false, explanation: "Nein – wer Elektronen abgibt, wird positiv geladen." },
      { text: "Ein Na⁺-Kation", correct: true,  explanation: "Richtig! Na gibt 1 Elektron ab → 11 Protonen, 10 Elektronen → Ladung +1." },
      { text: "Ein neutrales Na-Atom bleibt", correct: false, explanation: "Nein – durch Abgabe eines Elektrons ändert sich die Ladung." },
      { text: "Ein Na²⁺-Ion", correct: false, explanation: "Na gibt nur 1 Elektron ab (Gruppe 1), nicht 2." }
    ]
  },
  {
    topic: 1,
    question: "Was ist der Unterschied zwischen Kation und Anion?",
    options: [
      { text: "Kationen sind größer als Anionen", correct: false, explanation: "Die Größe ist nicht das entscheidende Kriterium." },
      { text: "Kationen sind positiv, Anionen negativ geladen", correct: true, explanation: "Richtig! Kation: Elektronen abgegeben → positiv. Anion: Elektronen aufgenommen → negativ." },
      { text: "Kationen enthalten mehr Protonen", correct: false, explanation: "Die Protonenzahl ändert sich bei Ionenbildung nicht – nur die Elektronenzahl." },
      { text: "Kationen kommen nur bei Metallen vor", correct: false, explanation: "Auch Nichtmetalle können Kationen bilden (z.B. NH₄⁺)." }
    ]
  },
  {
    topic: 1,
    question: "Warum streben Atome nach dem Edelgaszustand?",
    options: [
      { text: "Weil Edelgase teuer sind und Atome sie imitieren wollen", correct: false, explanation: "Das ist natürlich kein chemischer Grund." },
      { text: "Weil 8 Valenzelektronen (Oktettregel) besonders stabile Konfiguration ergeben", correct: true, explanation: "Richtig! Die vollständig besetzte Außenschale ist energetisch besonders günstig." },
      { text: "Weil Atome immer die höchste Ladung anstreben", correct: false, explanation: "Atome streben nach Neutralität oder stabiler Konfiguration, nicht nach höchster Ladung." },
      { text: "Weil Edelgaszustand bedeutet, keine Elektronen zu haben", correct: false, explanation: "Edelgase haben ihre Außenschale vollständig gefüllt (meist 8 Elektronen)." }
    ]
  },

  // ─── TOPIC 2: Lewis-Schreibweise ───
  {
    topic: 2,
    question: "Wie viele Valenzelektronen hat Schwefel (S, 6. Hauptgruppe)?",
    options: [
      { text: "2", correct: false, explanation: "2 Valenzelektronen hätten Elemente der 2. Hauptgruppe (z.B. Mg)." },
      { text: "4", correct: false, explanation: "4 Valenzelektronen hätten Elemente der 4. Hauptgruppe (z.B. C, Si)." },
      { text: "6", correct: true,  explanation: "Richtig! Die Hauptgruppennummer = Anzahl der Valenzelektronen. S: 6. Hauptgruppe → 6 Valenzelektronen." },
      { text: "8", correct: false, explanation: "8 Valenzelektronen hätten Edelgase (vollständig besetzte Außenschale)." }
    ]
  },
  {
    topic: 2,
    question: "In der Lewis-Schreibweise werden Elektronen zuerst …",
    options: [
      { text: "… paarweise auf alle 4 Seiten des Symbols verteilt", correct: false, explanation: "Nein – erst werden alle 4 Seiten mit je einem Elektron besetzt, bevor aufgefüllt wird." },
      { text: "… einzeln auf je eine Seite des Symbols gesetzt (erst dann Paare)", correct: true, explanation: "Richtig! Hund'sche Regel: Erst jede Seite einmal besetzen (4 einzelne Elektronen), dann Paare bilden." },
      { text: "… alle oben platziert, dann im Uhrzeigersinn", correct: false, explanation: "Die Reihenfolge ist nicht oben-im-Uhrzeigersinn, sondern alle 4 Seiten gleichmäßig." },
      { text: "… nur dann gezeigt, wenn sie Bindungen eingehen", correct: false, explanation: "Nein – alle Valenzelektronen werden dargestellt, auch freie Paare." }
    ]
  },
  {
    topic: 2,
    question: "Welche Lewis-Formel gehört zu Chlor (Cl, 7. Hauptgruppe)?",
    options: [
      { text: "· Cl · (2 einzelne Elektronen)", correct: false, explanation: "Cl hat 7 Valenzelektronen: 3 Paare + 1 einzelnes Elektron." },
      { text: ":Cl· (3 Paare + 1 einzelnes Elektron)", correct: true,  explanation: "Richtig! 7 Valenzelektronen = 3 freie Paare (6 Elektronen) + 1 einzelnes Radikal-Elektron." },
      { text: "::Cl:: (4 Paare)", correct: false, explanation: "4 Paare = 8 Elektronen, das wäre Edelgas-Konfiguration (z.B. Ar)." },
      { text: "Cl (kein Elektron)", correct: false, explanation: "Ohne Elektronenpunkte wäre das ein Edelgas ohne Valenzelektronen." }
    ]
  },

  // ─── TOPIC 3: Elektrischer Strom ───
  {
    topic: 3,
    question: "Was sind die Ladungsträger im Metall?",
    options: [
      { text: "Ionen", correct: false, explanation: "Ionen sind Ladungsträger in Lösungen und Schmelzen, nicht in Metallen." },
      { text: "Protonen", correct: false, explanation: "Protonen sitzen fest im Kern und bewegen sich nicht." },
      { text: "Freie Elektronen", correct: true,  explanation: "Richtig! Im Metall bilden die Valenzelektronen einen 'Elektronen-See' – sie können sich frei bewegen." },
      { text: "Atome", correct: false, explanation: "Die Metallatome/-ionen sitzen fest im Gitter und bewegen sich kaum." }
    ]
  },
  {
    topic: 3,
    question: "Warum leitet eine Natriumchlorid-Lösung (NaCl-Lösung) elektrischen Strom?",
    options: [
      { text: "Weil Wasser selbst ein guter Leiter ist", correct: false, explanation: "Reines Wasser ist tatsächlich kaum leitend – erst die Ionen machen die Lösung leitfähig." },
      { text: "Weil NaCl-Moleküle im Wasser schwimmen", correct: false, explanation: "NaCl bildet keine Moleküle, sondern dissoziiert in Na⁺- und Cl⁻-Ionen." },
      { text: "Weil Na⁺- und Cl⁻-Ionen frei beweglich sind", correct: true,  explanation: "Richtig! In Lösung dissoziiert NaCl in bewegliche Ionen → Ionenleitung." },
      { text: "Weil NaCl-Atome Elektronen abgeben", correct: false, explanation: "Atome werden nicht im Wasser 'abgegeben' – es findet Dissoziation statt." }
    ]
  },
  {
    topic: 3,
    question: "Warum leitet festes Kochsalz (NaCl) keinen Strom?",
    options: [
      { text: "Weil es keine Ladungen enthält", correct: false, explanation: "Festes NaCl enthält Ionen (Na⁺ und Cl⁻) – aber sie sind im Gitter fixiert." },
      { text: "Weil die Ionen im Kristallgitter festgehalten werden und sich nicht bewegen können", correct: true,  explanation: "Richtig! Im Festkörper sind die Ionen immobil → kein Ladungstransport möglich." },
      { text: "Weil NaCl keine Elektronen hat", correct: false, explanation: "NaCl enthält selbstverständlich Elektronen – aber keine freien." },
      { text: "Weil Salz ein Metall ist", correct: false, explanation: "Salz ist kein Metall, sondern eine Ionenverbindung." }
    ]
  },

  // ─── TOPIC 3 Bonus ───
  {
    topic: 3,
    question: "Was ist der Unterschied zwischen Elektronen- und Ionenleitung?",
    options: [
      { text: "Elektronen- und Ionenleitung sind dasselbe", correct: false, explanation: "Nein – die Ladungsträger und Mechanismen sind grundlegend verschieden." },
      { text: "Elektronenleitung: freie Elektronen im Metall; Ionenleitung: geladene Ionen in Lösungen/Schmelzen", correct: true, explanation: "Richtig! Im Metall transportieren freie Elektronen die Ladung; in Elektrolytlösungen tun dies bewegliche Ionen." },
      { text: "Ionenleitung findet nur in Metallen statt", correct: false, explanation: "Ionenleitung findet in Salzlösungen und Schmelzen statt, nicht in Metallen." },
      { text: "Elektronenleitung ist langsamer als Ionenleitung", correct: false, explanation: "Elektronen sind viel leichter und schneller als Ionen – Metalle leiten daher besser." }
    ]
  },

  // ─── TOPIC 4: Ionenbildung ───
  {
    topic: 4,
    question: "Was passiert bei der Reaktion Na + Cl → NaCl auf Elektronenebene?",
    options: [
      { text: "Na und Cl teilen sich ein Elektron", correct: false, explanation: "Das wäre eine kovalente Bindung. Bei NaCl findet eine vollständige Elektronenübertragung statt." },
      { text: "Na überträgt ein Elektron auf Cl → Na⁺ + Cl⁻", correct: true,  explanation: "Richtig! Na gibt das Valenzelektron ab (→ Na⁺), Cl nimmt es auf (→ Cl⁻). Ionenbindung!" },
      { text: "Cl überträgt ein Elektron auf Na", correct: false, explanation: "Nein – Na hat niedrigere EN und gibt leichter Elektronen ab als das sehr elektronegative Cl." },
      { text: "Beide Atome nehmen ein Elektron auf", correct: false, explanation: "Es kann nicht beide Atome gleichzeitig Elektronen aufnehmen – Erhaltung der Ladung!" }
    ]
  },
  {
    topic: 4,
    question: "Welche Kraft hält Na⁺ und Cl⁻ im Ionenkristall zusammen?",
    options: [
      { text: "Magnetische Kraft", correct: false, explanation: "Magnete haben mit chemischen Bindungen nichts zu tun." },
      { text: "Elektrostatische Anziehung (Coulomb-Kraft)", correct: true,  explanation: "Richtig! Entgegengesetzt geladene Ionen ziehen sich elektrostatisch an – das ist die Coulomb-Kraft." },
      { text: "Kovalente Bindung", correct: false, explanation: "Kovalente Bindungen entstehen durch gemeinsame Elektronen, nicht bei Ionenverbindungen." },
      { text: "Metallbindung", correct: false, explanation: "Metallbindung beschreibt den Elektronen-See in Metallen – nicht in Salzgittern." }
    ]
  },
  {
    topic: 4,
    question: "Welche Bedingung muss ein Atom erfüllen, um leicht Ionen zu bilden?",
    options: [
      { text: "Es muss sehr schwer sein (hohes Atomgewicht)", correct: false, explanation: "Das Atomgewicht spielt für die Ionenbildung keine direkte Rolle." },
      { text: "Es muss entweder sehr wenige oder sehr viele Valenzelektronen haben", correct: true,  explanation: "Richtig! Metalle (1–3 VE) geben leicht ab; Nichtmetalle (5–7 VE) nehmen leicht auf → beide streben nach Edelgaskonfiguration." },
      { text: "Es muss gasförmig sein", correct: false, explanation: "Ionenbildung ist unabhängig vom Aggregatzustand – auch feste Metalle bilden Ionen." },
      { text: "Es muss bereits ionisiert sein", correct: false, explanation: "Nein – neutrale Atome können Ionen bilden." }
    ]
  },

  // ─── TOPIC 5: Ionengitter ───
  {
    topic: 5,
    question: "Warum haben Salze hohe Schmelzpunkte?",
    options: [
      { text: "Wegen der schwachen kovalenten Bindungen", correct: false, explanation: "Salze haben keine kovalenten Bindungen – sie haben starke Ionenbindungen." },
      { text: "Wegen der starken elektrostatischen Kräfte zwischen den Ionen", correct: true,  explanation: "Richtig! Die Coulomb-Kräfte zwischen entgegengesetzt geladenen Ionen sind sehr stark → viel Energie zum Schmelzen nötig." },
      { text: "Wegen der metallischen Bindung", correct: false, explanation: "Salze haben keine metallische Bindung." },
      { text: "Wegen ihrer schwarzen Farbe, die Wärme speichert", correct: false, explanation: "Farbe hat mit dem Schmelzpunkt nichts zu tun." }
    ]
  },
  {
    topic: 5,
    question: "Warum sind Ionenkristalle spröde?",
    options: [
      { text: "Weil sie alt und verwittert sind", correct: false, explanation: "Sprödigkeit ist eine strukturelle Eigenschaft, keine Alterserscheinung." },
      { text: "Beim Verschieben der Gitterschichten kommen gleich geladene Ionen nebeneinander → Abstoßung → Bruch", correct: true,  explanation: "Richtig! Mechanischer Druck verschiebt Schichten so, dass + neben + und − neben − liegt → starke Abstoßung → Riss." },
      { text: "Weil Salze Angst vor Druck haben", correct: false, explanation: "Das ist keine wissenschaftliche Erklärung." },
      { text: "Weil die Ionen zu groß sind um zu gleiten", correct: false, explanation: "Die Ionengröße ist nicht der Hauptgrund – der Ladungswechsel beim Gleiten ist entscheidend." }
    ]
  },
  {
    topic: 5,
    question: "In welchem Zustand leitet Natriumchlorid elektrischen Strom?",
    options: [
      { text: "Nur als Feststoff", correct: false, explanation: "Im Feststoff sind die Ionen fixiert und können sich nicht bewegen → kein Strom." },
      { text: "Weder als Feststoff noch in Lösung", correct: false, explanation: "In Lösung leitet NaCl sehr wohl." },
      { text: "Als Lösung und in der Schmelze (nicht als Feststoff)", correct: true,  explanation: "Richtig! In Lösung und Schmelze werden die Ionen frei beweglich → Ionenleitung. Im Feststoff: kein Strom." },
      { text: "Nur als Schmelze, nicht in Lösung", correct: false, explanation: "Sowohl Schmelze als auch Lösung leiten – in beiden Fällen sind die Ionen mobil." }
    ]
  },

  // ─── TOPIC 6: Elektronenpaarbindung ───
  {
    topic: 6,
    question: "Was ist eine Elektronenpaarbindung?",
    options: [
      { text: "Die Übertragung von Elektronen von einem Atom auf ein anderes", correct: false, explanation: "Das wäre eine Ionenbindung. Bei der EPB werden Elektronen geteilt, nicht übertragen." },
      { text: "Zwei Atome teilen sich gemeinsame Elektronenpaare", correct: true,  explanation: "Richtig! Bei der kovalenten Bindung besitzen beide Atome die bindenden Elektronen gemeinsam." },
      { text: "Elektronen fließen frei durch den Körper", correct: false, explanation: "Das beschreibt die Metallbindung, nicht die kovalente Bindung." },
      { text: "Ein Atom nimmt alle Elektronen des anderen auf", correct: false, explanation: "Würde ein Atom alle Elektronen des anderen aufnehmen, wäre das eine extreme Form der Ionenbindung." }
    ]
  },
  {
    topic: 6,
    question: "Welche Bindung hat das Wasserstoff-Molekül (H₂)?",
    options: [
      { text: "Ionenbindung (H⁺ und H⁻)", correct: false, explanation: "Beide H-Atome sind identisch – gleiche Elektronegativität → keine Ionenbindung." },
      { text: "Einfachbindung (1 gemeinsames Elektronenpaar)", correct: true,  explanation: "Richtig! Jedes H-Atom bringt 1 Elektron → 1 gemeinsames EP → H–H." },
      { text: "Dreifachbindung (3 gemeinsame Elektronenpaare)", correct: false, explanation: "H hat nur 1 Valenzelektron pro Atom – eine Dreifachbindung ist nicht möglich." },
      { text: "Metallbindung", correct: false, explanation: "H₂ ist ein Nichtmetall-Molekül." }
    ]
  },
  {
    topic: 6,
    question: "Wie viele gemeinsame Elektronenpaare hat eine Doppelbindung?",
    options: [
      { text: "1", correct: false, explanation: "1 EP = Einfachbindung (z.B. H₂, Cl₂)." },
      { text: "2", correct: true,  explanation: "Richtig! Doppelbindung = 2 bindende Elektronenpaare (z.B. O=O in O₂)." },
      { text: "3", correct: false, explanation: "3 EP = Dreifachbindung (z.B. N≡N in N₂)." },
      { text: "4", correct: false, explanation: "4 EP wäre ungewöhnlich – die meisten Atome können max. 4 Bindungen eingehen." }
    ]
  },

  // ─── TOPIC 7: Luft leitet nicht ───
  {
    topic: 7,
    question: "Warum ist Luft (N₂, O₂) ein elektrischer Isolator?",
    options: [
      { text: "Weil Luft zu kalt ist", correct: false, explanation: "Temperatur ist nicht der Hauptgrund – auch warme Luft leitet nicht (außer bei Blitzen)." },
      { text: "Weil alle Elektronen in Bindungen oder als freie Paare am Molekül gebunden sind → keine freien Ladungsträger", correct: true,  explanation: "Richtig! N₂ und O₂ haben kovalente Bindungen – alle Elektronen sind fest gebunden, keine freien Ladungsträger." },
      { text: "Weil Luft keine Elektronen enthält", correct: false, explanation: "Luft enthält selbstverständlich Elektronen – aber keine freien, beweglichen." },
      { text: "Weil N₂ und O₂ schwer sind", correct: false, explanation: "Das Molekulargewicht hat keinen direkten Einfluss auf die elektrische Leitfähigkeit." }
    ]
  },
  {
    topic: 7,
    question: "Was passiert beim Blitz, dass Luft kurzzeitig leitet?",
    options: [
      { text: "Die Luft wird nass", correct: false, explanation: "Regen macht Luft nicht leitend – Wasser ist als Reinsubstanz kaum leitend." },
      { text: "Extreme elektrische Energie ionisiert die Luftmoleküle → freie Ionen und Elektronen entstehen", correct: true,  explanation: "Richtig! Bei extrem hoher Spannung werden N₂ und O₂ ionisiert – freie Ladungsträger entstehen kurzzeitig." },
      { text: "Die Luft wird kälter, was Leitfähigkeit erhöht", correct: false, explanation: "Kälte erhöht die Leitfähigkeit von Luft nicht." },
      { text: "Metallische Verbindungen fallen aus der Luft", correct: false, explanation: "Es gibt keine Metalle in normaler Luft." }
    ]
  },
  {
    topic: 7,
    question: "Welche Bindung verbindet die Atome im Stickstoffmolekül (N₂)?",
    options: [
      { text: "Einfachbindung", correct: false, explanation: "N hat 5 Valenzelektronen, je 3 unbindende → 3 gemeinsame EP → Dreifachbindung." },
      { text: "Doppelbindung", correct: false, explanation: "Doppelbindung (2 EP) wäre z.B. O₂ oder CO₂." },
      { text: "Dreifachbindung (N≡N)", correct: true,  explanation: "Richtig! N hat 5 Valenzelektronen: 1 freies Paar + 3 Radikalelektronen → 3 gemeinsame EP → N≡N." },
      { text: "Ionenbindung", correct: false, explanation: "N₂ besteht aus zwei gleichen Nichtmetallatomen → keine Ionenübertragung möglich." }
    ]
  },

  // ─── TOPIC 5 Bonus ───
  {
    topic: 5,
    question: "Warum löst sich Kochsalz (NaCl) in Wasser?",
    options: [
      { text: "Weil Wasser ein Metall ist", correct: false, explanation: "Wasser ist keine metallische Substanz – es ist ein polares Molekül." },
      { text: "Weil polare Wassermoleküle die Ionen aus dem Gitter herauslösen (Hydratation)", correct: true, explanation: "Richtig! Wassermoleküle (δ+ und δ−) umhüllen die Ionen, überwinden die Gitterkräfte und lösen die Ionen heraus (Hydratation / Dissoziation)." },
      { text: "Weil NaCl keine starken Bindungen hat", correct: false, explanation: "NaCl hat eigentlich sehr starke Ionenbindungen – aber polare Lösungsmittel wie Wasser können sie überwinden." },
      { text: "Weil Kationen und Anionen gleich groß sind", correct: false, explanation: "Die Ionengröße ist nicht der Hauptgrund für die Löslichkeit in Wasser." }
    ]
  },

  // ─── TOPIC 8: Metallbindung ───
  {
    topic: 8,
    question: "Was beschreibt das Elektronen-See-Modell der Metalle?",
    options: [
      { text: "Metall-Ionen schwimmen in einem See aus Wasser", correct: false, explanation: "Der 'See' besteht aus Elektronen, nicht aus Wasser." },
      { text: "Positive Metallionen sind in einem Gitter angeordnet, umgeben von frei beweglichen Elektronen", correct: true,  explanation: "Richtig! Die Valenzelektronen lösen sich von den Atomen und bilden ein 'Elektronen-Meer', das die Kationen zusammenhält." },
      { text: "Elektronen sind fest an die Atome gebunden und können sich nicht bewegen", correct: false, explanation: "Das Gegenteil ist der Fall – die freie Beweglichkeit ist das Besondere der Metallbindung." },
      { text: "Alle Atome sind gleich geladen", correct: false, explanation: "Im Metall gibt es positive Metallionen (Kationen) und negative Elektronen." }
    ]
  },
  {
    topic: 8,
    question: "Warum sind Metalle verformbar (duktil)?",
    options: [
      { text: "Weil Metalle weich wie Butter sind", correct: false, explanation: "Nicht alle Metalle sind weich – und die Erklärung der Duktilität liegt in der Bindung." },
      { text: "Weil die Gitterschichten aneinander abgleiten können, ohne dass die Bindung reißt", correct: true,  explanation: "Richtig! Der Elektronen-See passt sich jeder Verschiebung an → Schichten können gleiten → kein Bruch wie bei Ionenkristallen." },
      { text: "Weil Metalle keine Bindungen haben", correct: false, explanation: "Metalle haben starke metallische Bindungen – aber flexiblere als Ionenbindungen." },
      { text: "Weil Metallelektronen aus dem Metall entweichen", correct: false, explanation: "Im Normalbetrieb verlassen die Elektronen das Metall nicht." }
    ]
  },
  {
    topic: 8,
    question: "Welche Eigenschaft der Metalle wird NICHT durch den Elektronen-See erklärt?",
    options: [
      { text: "Elektrische Leitfähigkeit", correct: false, explanation: "Freie Elektronen bewegen sich im Feld → Leitfähigkeit wird durch den Elektronen-See erklärt." },
      { text: "Metallischer Glanz", correct: false, explanation: "Freie Elektronen reflektieren Licht → metallischer Glanz ist eine Folge des Elektronen-Sees." },
      { text: "Radioaktivität", correct: true,  explanation: "Richtig! Radioaktivität ist eine Kerneigenschaft (instabile Kerne), nicht eine Folge der Metallbindung." },
      { text: "Wärmeleitfähigkeit", correct: false, explanation: "Elektronen transportieren thermische Energie → Wärmeleitfähigkeit wird durch den Elektronen-See erklärt." }
    ]
  },

  // ─── TOPIC 9: Elektronegativität ───
  {
    topic: 9,
    question: "Was gibt die Elektronegativität (EN) an?",
    options: [
      { text: "Die Anzahl der Protonen im Kern", correct: false, explanation: "Die Protonenzahl = Ordnungszahl. EN ist eine andere Größe." },
      { text: "Wie stark ein Atom die Elektronen einer Bindung zu sich hinzieht", correct: true,  explanation: "Richtig! EN nach Pauling: Die Fähigkeit eines Atoms, bindende Elektronen anzuziehen." },
      { text: "Die Energie, die bei einer Reaktion freigesetzt wird", correct: false, explanation: "Das wäre die Reaktionsenthalpie, nicht die Elektronegativität." },
      { text: "Die Anzahl der Valenzelektronen", correct: false, explanation: "Valenzelektronen und EN sind verwandt, aber nicht dasselbe." }
    ]
  },
  {
    topic: 9,
    question: "Welches Element hat die höchste Elektronegativität?",
    options: [
      { text: "Sauerstoff (O)", correct: false, explanation: "O hat EN = 3,5 – sehr hoch, aber nicht die höchste." },
      { text: "Fluor (F)", correct: true,  explanation: "Richtig! Fluor hat EN = 4,0 nach Pauling – die höchste aller Elemente." },
      { text: "Natrium (Na)", correct: false, explanation: "Na hat EN = 0,9 – sehr niedrig (Metall, gibt Elektronen ab)." },
      { text: "Chlor (Cl)", correct: false, explanation: "Cl hat EN = 3,0 – hoch, aber Fluor ist noch elektronegativer." }
    ]
  },
  {
    topic: 9,
    question: "Wie verändert sich die EN in einer Periode (von links nach rechts)?",
    options: [
      { text: "Sie nimmt ab", correct: false, explanation: "Von links nach rechts nimmt die Kernladungszahl zu → stärkere Anziehung auf Elektronen → EN nimmt zu." },
      { text: "Sie bleibt gleich", correct: false, explanation: "EN ist nicht konstant in einer Periode." },
      { text: "Sie nimmt zu", correct: true,  explanation: "Richtig! In einer Periode nimmt die EN von links nach rechts zu (mehr Protonen, gleiche Schale → stärkere Kernladung)." },
      { text: "Sie schwankt unregelmäßig", correct: false, explanation: "Der Trend ist klar und regelmäßig (mit wenigen Ausnahmen)." }
    ]
  },

  // ─── TOPIC 10: ΔEN und Bindungstypen ───
  {
    topic: 10,
    question: "HCl hat ΔEN = 0,9 (Cl: 3,0; H: 2,1). Welcher Bindungstyp liegt vor?",
    options: [
      { text: "Unpolare Bindung (ΔEN = 0)", correct: false, explanation: "ΔEN = 0 bedeutet gleiche EN (z.B. H₂, Cl₂). Bei HCl ist ΔEN = 0,9." },
      { text: "Polare kovalente Bindung (0 < ΔEN < 1,7)", correct: true,  explanation: "Richtig! ΔEN = 0,9 liegt im Bereich 0–1,7 → polare kovalente Bindung. Cl zieht die Elektronen stärker an → δ⁻ an Cl." },
      { text: "Ionenbindung (ΔEN ≥ 1,7)", correct: false, explanation: "Für Ionenbindung wäre ΔEN ≥ 1,7 nötig. NaCl hat z.B. ΔEN = 2,1." },
      { text: "Metallbindung", correct: false, explanation: "Metallbindung gibt es zwischen Metall-Atomen, nicht zwischen H und Cl." }
    ]
  },
  {
    topic: 10,
    question: "NaCl hat ΔEN = 2,1 (Cl: 3,0; Na: 0,9). Was folgt daraus?",
    options: [
      { text: "Es liegt eine unpolare Bindung vor", correct: false, explanation: "Unpolar wäre ΔEN = 0. Bei ΔEN = 2,1 ist die Bindung höchst polar." },
      { text: "Es liegt eine polare kovalente Bindung vor", correct: false, explanation: "Polare Bindung wäre bei 0 < ΔEN < 1,7. Hier ist ΔEN = 2,1 ≥ 1,7." },
      { text: "Es liegt eine Ionenbindung vor (ΔEN ≥ 1,7)", correct: true,  explanation: "Richtig! ΔEN = 2,1 ≥ 1,7 → Ionenbindung. Das Elektron wird praktisch vollständig auf Cl übertragen → Na⁺ + Cl⁻." },
      { text: "Es liegt eine Metallbindung vor", correct: false, explanation: "Na ist zwar ein Metall, aber Metallbindung ist eine kollektive Bindung zwischen Metall-Atomen, nicht Na+Cl." }
    ]
  },
  {
    topic: 10,
    question: "Was bedeuten die Symbole δ+ und δ− bei einer polaren Bindung?",
    options: [
      { text: "Die Atome sind vollständig ionisiert", correct: false, explanation: "Vollständige Ionisierung wäre eine Ionenbindung. δ-Symbole zeigen Teilladungen an." },
      { text: "Es gibt Teilladungen – das elektronegativere Atom trägt δ−", correct: true,  explanation: "Richtig! Bei polarer Bindung sind Elektronen zum elektronegativen Atom verschoben → Partialladungen δ+ am positiveren, δ− am negativeren Atom." },
      { text: "Die Bindung ist vollständig unpolar", correct: false, explanation: "Unpolare Bindungen zeigen keine δ-Symbole." },
      { text: "Delta bezeichnet die Bindungslänge", correct: false, explanation: "δ+ und δ− sind Zeichen für Partialladungen, nicht für Längen." }
    ]
  },

  // ─── TOPIC 8 Bonus ───
  {
    topic: 8,
    question: "Warum leiten Metalle Wärme gut?",
    options: [
      { text: "Weil Metalle immer warm sind", correct: false, explanation: "Das ist keine Erklärung für die Wärmeleitfähigkeit." },
      { text: "Weil freie Elektronen thermische Energie schnell durch das Gitter transportieren", correct: true, explanation: "Richtig! Dieselben freien Elektronen, die Strom leiten, transportieren auch Wärme effizient." },
      { text: "Weil Metallatome besonders groß sind", correct: false, explanation: "Die Atomgröße ist nicht der Grund für die Wärmeleitfähigkeit." },
      { text: "Weil Metalle keine Bindungen haben", correct: false, explanation: "Metalle haben starke metallische Bindungen – aber flexible dank des Elektronen-Sees." }
    ]
  },

  // ─── TOPIC 11: Elektrolyse ───
  {
    topic: 11,
    question: "Was wandert bei der Elektrolyse zur Kathode (Minuspol)?",
    options: [
      { text: "Anionen (negativ geladene Ionen)", correct: false, explanation: "Gleichnamige Ladungen stoßen sich ab – Anionen werden von der negativen Kathode abgestoßen." },
      { text: "Kationen (positiv geladene Ionen)", correct: true,  explanation: "Richtig! Ungleiche Ladungen ziehen sich an → positive Kationen wandern zur negativen Kathode." },
      { text: "Elektronen wandern durch die Lösung", correct: false, explanation: "Elektronen wandern durch den Draht, nicht durch die Lösung – in der Lösung wandern Ionen." },
      { text: "Nichts – die Ionen bleiben an Ort und Stelle", correct: false, explanation: "Ohne Ionenwanderung gäbe es keine Elektrolyse." }
    ]
  },
  {
    topic: 11,
    question: "Was bedeutet 'LEO sagt GER'?",
    options: [
      { text: "Elektronen-Abgabe ist Oxidation; Elektronen-Aufnahme ist Reduktion", correct: true,  explanation: "Richtig! LEO: Losing Electrons = Oxidation. GER: Gaining Electrons = Reduction. Merkhilfe für Redoxreaktionen." },
      { text: "Elektronen-Aufnahme ist Oxidation; Elektronen-Abgabe ist Reduktion", correct: false, explanation: "Genau umgekehrt! Abgabe von Elektronen = Oxidation (LEO). Aufnahme = Reduktion (GER)." },
      { text: "Elektronen wandern immer von der Anode zur Kathode durch die Lösung", correct: false, explanation: "Elektronen fließen durch den äußeren Leiter (Draht), nicht durch die Lösung." },
      { text: "LEO und GER sind Namen von Chemikern", correct: false, explanation: "Es ist eine Merkhilfe: Loss of Electrons = Oxidation / Gain of Electrons = Reduction." }
    ]
  },
  {
    topic: 11,
    question: "Wozu dient Elektrolyse in der Industrie?",
    options: [
      { text: "Nur zum Laden von Akkus", correct: false, explanation: "Akkus nutzen Elektrochemie, aber Elektrolyse hat viele weitere Anwendungen." },
      { text: "Zur Herstellung von Metallen (z.B. Al), Chlor, Wasserstoff und zur Galvanik", correct: true,  explanation: "Richtig! Elektrolyse wird industriell für Aluminiumherstellung, Chloralkali-Elektrolyse, Galvanisierung und Wasserelektrolyse genutzt." },
      { text: "Nur zum Entsalzen von Meerwasser", correct: false, explanation: "Entsalzung nutzt meist Umkehrosmose, nicht Elektrolyse." },
      { text: "Zur Erzeugung von Kernenergie", correct: false, explanation: "Kernenergie kommt aus Kernspaltung/-fusion, nicht aus Elektrolyse." }
    ]
  }

  // ─── TOPIC 11 Bonus ───
  {
    topic: 11,
    question: "An welcher Elektrode findet Oxidation statt?",
    options: [
      { text: "Kathode (Minuspol)", correct: false, explanation: "An der Kathode findet Reduktion statt (Elektronen-Aufnahme: GER)." },
      { text: "Anode (Pluspol)", correct: true, explanation: "Richtig! An der Anode geben Anionen Elektronen ab → Oxidation (LEO = Loss of Electrons = Oxidation)." },
      { text: "An beiden Elektroden gleich", correct: false, explanation: "Oxidation und Reduktion finden getrennt statt: Anode = Oxidation, Kathode = Reduktion." },
      { text: "Nirgendwo – Elektrolyse ist kein Redoxprozess", correct: false, explanation: "Elektrolyse ist ein Redoxprozess: Übertragung von Elektronen über den äußeren Stromkreis." }
    ]
  }
];
