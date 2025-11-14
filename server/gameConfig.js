const gameConfig = {
  lastManStanding: {
    rounds: [
      {
        title: "Alle Länder Europas",
        keywords: [
          "Albanien", "Andorra", "Armenien", "Aserbaidschan", "Belgien", "Bosnien und Herzegowina",
          "Bulgarien", "Dänemark", "Deutschland", "Estland", "Finnland", "Frankreich", "Georgien",
          "Griechenland", "Großbritannien", "Ungarn", "Irland", "Island", "Italien", "Kasachstan",
          "Kosovo", "Kroatien", "Lettland", "Liechtenstein", "Litauen", "Luxemburg", "Malta",
          "Moldau", "Monaco", "Montenegro", "Niederlande", "Nordmazedonien", "Norwegen", "Österreich",
          "Polen", "Portugal", "Rumänien", "Russland", "San Marino", "Schweden", "Schweiz",
          "Serbien", "Slowakei", "Slowenien", "Spanien", "Tschechien", "Türkei", "Ukraine",
          "Ungarn", "Vatikanstadt", "Vereinigtes Königreich", "Weißrussland", "Zypern"
        ]
      },
      {
        title: "Chemische Elemente mit Ordnungszahl 1 bis 30",
        keywords: [
          "Wasserstoff", "Helium", "Lithium", "Beryllium", "Bor", "Kohlenstoff", "Stickstoff",
          "Sauerstoff", "Fluor", "Neon", "Natrium", "Magnesium", "Aluminium", "Silicium",
          "Phosphor", "Schwefel", "Chlor", "Argon", "Kalium", "Calcium",
          "Scandium", "Titan", "Vanadium", "Chrom", "Mangan", "Eisen",
          "Kobalt", "Nickel", "Kupfer", "Zink"
        ]
      },
      {
        title: "Fahrer in Mario Kart 8 Deluxe",
        keywords: [
          "Mario","Luigi","Peach","Daisy","Rosalina","Tanuki Mario","Katzen Peach","Yoshi",
          "Koopa","Shy Guy","Lakitu","Toad","Toadette","Knochen Bowser","Baby Mario","Baby Luigi",
          "Baby Peach","Baby Daisy","Baby Rosalina","Metall Mario","Gold Mario","Pink Gold Peach",
          "Wario","Waluigi","Donkey Kong","Bowser","Morton","Larry","Wendy","Iggy","Roy","Lemmy",
          "Ludwig","Inkling Boy","Inkling Girl","Link","Mii"
        ]
      },
       {
        title: "Alle Olympischen Sommersportarten",
        keywords: [
          "Badminton", "Baseball", "Basketball", "Bogenschießen", "Boxen",
          "Cricket", "Breakdance", "Fechten", "Flag Football", "Fußball", "Gewichtheben", "Golf",
          "Handball", "Hockey", "Judo", "Kanusport", "Lacrosse", "Leichtathletik",
          "Moderner Fünfkampf", "Radsport", "Reitsport", "Ringen", "Rudern", "Rugby",
          "Schießsport", "Schwimmen", "Segeln", "Skateboard", "Squash", "Sportklettern",
          "Surfen", "Taekwondo", "Tennis", "Tischtennis", "Triathlon", "Turnen", 
          "Volleyball"
        ]
      },
      {
        title: "Tiere auf dem Bauernhof",
        keywords: [
          "Kuh", "Schwein", "Schaf", "Ziege", "Huhn", "Hahn", "Ente", "Gans", "Pferd", "Esel",
          "Truthahn", "Kaninchen", "Katze", "Hund", "Lama", "Alpaka", "Pfau", "Wachtel", 
          "Biene", "Meerschweinchen", "Schwalbe", "Taube", "Ratte", "Maus"
        ]
      }
    ]
  },

  wwm: {
    questions: [
      { question: "Was gehört üblicherweise zu einem Computer?", answers: ["KATZE", "MAUS", "RATTE", "FROSCH"], correctAnswer: 1 },
      { question: "Ist jemand schon mehrfacher Urgroßvater, dann haben bereits seine ...?", answers: ["SCHWIEGER SÖHNE", "STIEF TÖCHTER", "ENKEL KINDER", "HALB GESCHWISTER"], correctAnswer: 2 },
      { question: "Fährt das Schiff in die falsche Richtung, hat sich der Kapitän sozusagen ...?", answers: ["VERSTEUERT", "VERZINST", "VERZOLLT", "VERZAHLT"], correctAnswer: 0 },
      { question: "Welche Form hat ein Stoppschild in Deutschland?", answers: ["SECHSECK", "KREIS", "ACHTECK", "DREIECK"], correctAnswer: 2 },
      { question: "Wie nennt man plötzlich auftretende überfrierende Nässe?", answers: ["SOFTEIS", "BLITZEIS", "GLATTEIS", "TROCKENEIS"], correctAnswer: 1 },
      { question: "Welches Gas atmen wir hauptsächlich ein?", answers: ["KOHLENSTOFFDIOXID", "HELIUM", "STICKSTOFF", "WASSERSTOFF"], correctAnswer: 2 },
      { question: "Was ist keine Programmiersprache?", answers: ["PYTHON", "JAVA", "LOTUS", "C++"], correctAnswer: 2 },
      { question: "In welcher Einheit wird elektrische Spannung gemessen?", answers: ["VOLT", "AMPERE", "WATT", "OHM"], correctAnswer: 0 },
      { question: "Was bekommt Charlie am Anfang des Filmes 'Charlie und die Schokoladenfabrik'?", answers: ["MAGISCHEN HUT", "LILA KAUGUMMI, DER IHN LILA MACHT", "GOLDENES TICKET", "EINEN OOMPA LOOMPA"], correctAnswer: 2 },
      { question: "Welche Farbe hat der mittlere Ring der olympischen Ringe?", answers: ["GELB", "SCHWARZ", "BLAU", "ES GIBT KEINEN MITTLEREN"], correctAnswer: 1 },
      { question: "Wie nennt man den Wechsel von Raupen zu Schmetterlingen?", answers: ["MUTATION", "EVOLUTION", "PUBERTÄT", "METAMORPHOSE"], correctAnswer: 3 },
      { question: "Welches Organ produziert Insulin?", answers: ["LEBER", "BAUCHSPEICHELDRÜSE", "NIERE", "MILZ"], correctAnswer: 1 },
      { question: "Welches Land war früher als Persien bekannt?", answers: ["IRAK", "SYRIEN", "IRAN", "JORDANIEN"], correctAnswer: 2 },
      { question: "Welches Tier kann im Verhältnis zu seiner Größe am höchsten springen?", answers: ["FLOH", "FROSCH", "KÄNGURU", "HASE"], correctAnswer: 0 },
      { question: "Welches Teilchen trägt eine negative elektrische Ladung?", answers: ["ELEKTRON", "NEUTRON", "RPROTON", "ALLE"], correctAnswer: 0 },
      { question: "Wie heißt der Bösewicht in The Dark Knight von 2008?", answers: ["JOKER", "DARK KNIGHT", "BATMAN", "UNBEKANNT"], correctAnswer: 0 },
      { question: "Was kommt vor einer Quadrillion?", answers: ["TRILLION", "TRILLIARDE", "QUADRILLIARDE", "QUINTILLION"], correctAnswer: 1 },
      { question: "Welches Tier ist ein Nagetier?", answers: ["IGEL", "MARDER", "BIBER", "FRETTCHEN"], correctAnswer: 2 },
      { question: "Von wem stammt das Gemälde 'Das letzte Abendmahl'?", answers: ["MICHELANGELO", "LEONARDO DA VINCI", "CLAUDE MONET", "PABLO PICASSO"], correctAnswer: 1 },
      { question: "In etwa wie weit ist der Ort des Knalls eines Blitzes entfernt, wenn ich ihn unter normalen Bedingungen genau eine Sekunde später höre?", answers: ["3.4M", "34M", "340M", "3.4KM"], correctAnswer: 2 },
      { question: "Wie heißt die Hauptstadt von Hessen?", answers: ["WIESBADEN", "FRANKFURT (ODER)", "DARMSTADT", "FRANKFURT AM MAIN"], correctAnswer: 0 },
      { question: "Wann wurde Queen Elizabeth II. zur Königin gekrönt?", answers: ["1953", "1970", "2000", "1937"], correctAnswer: 0 },
      { question: "Die Ringe von welchem Planet kann man mit bloßem Auge sehen?", answers: ["SATURN", "URANUS", "VENUS", "MARS"], correctAnswer: 0 },
      { question: "Wie viele Minuten haben zwei Tage?", answers: ["2880", "3200", "2940", "3180"], correctAnswer: 0 },
      { question: "Wofür steht 'USB'?", answers: ["UNIFIED SERIAL BOARD", "ULTRA SPEED BANDWITH", "USER SIGNAL BRIDGE", "UNIVERSAL SERIAL BUS"], correctAnswer: 3 },
      { question: "Was ist ein Synonym für 'opulent'?", answers: ["SCHLICHT", "PRACHTVOLL", "EINFACH", "SCHWACH"], correctAnswer: 1 },
      { question: "Wie nennt man eine Tierart, die nur in einem bestimmten Gebiet vorkommt?", answers: ["MIGRANT", "HYBRID", "ENDEMIT", "EXPATRIAT"], correctAnswer: 2 },
      { question: "Welche chemische Substanz wird als Tränengas benutzt?", answers: ["CS-GAS", "CHLORGAS", "OZON", "METHAN"], correctAnswer: 0 },
      { question: "Welcher Vulkan zerstörte 1833 die Insel Krakatau?", answers: ["KRAKATAU", "ÄTNA", "MAUNA LOA", "MOUNT EREBUS"], correctAnswer: 0 },
      { question: "Was ist 'Zeugma'?", answers: ["EIN MEDIZINISCHER BEGRIFF FÜR SPERMA", "EINE ANTIKE GRIECHISCHE STADT", "EIN VERB, WELCHES SICH AUF ZWEI SACHVERHALTE IN EINEM SATZ BEZIEHT", "EIN RELIGIÖSES SYMBOL AUS DER RÖMISCHEN MYTHOLOGIE"], correctAnswer: 2 }
    ]
  },

  symbolQuiz: {
    themes: [
      {
        keyword: "Das Internet",
        tips: [
          "Ich wurde in einem Labor in der Schweiz geboren.",
          "Mein 'Vater' Tim Berners-Lee hat mich erschaffen, um den Informationsaustausch zwischen Forschern zu vereinfachen.",
          "Heute bin ich ein globales Netz aus Milliarden von Seiten, das du täglich nutzt.",
          "Ohne mich könntest du diese Frage gerade nicht online lesen."
        ]
      },
      {
        keyword: "Superman",
        tips: [
          "Mein richtiger Name lautet Kal-El und ich stamme von einem fernen Planeten.",
          "Im Alltag bin ich ein tollpatschiger Journalist bei einer großen Tageszeitung.",
          "Meine einzige Schwäche ist ein grün leuchtendes Mineral von meinem Heimatplaneten.",
          "Ich bin der 'Mann aus Stahl' und trage ein großes 'S' auf der Brust."
        ]
      },
      {
        keyword: "Elvis Presley",
        tips: [
          "Ich wurde in Armut in Mississippi geboren und veränderte die Musikwelt für immer.",
          "Ich lebte und starb in meinem Anwesen namens Graceland.",
          "Meine provokanten Hüftbewegungen brachten mir den Spitznamen 'The Pelvis' ein.",
          "Ich bin der unbestrittene 'King of Rock 'n' Roll'."
        ]
      },
      {
        keyword: "Kleopatra",
        tips: [
          "Ich war eine ägyptische Herrscherin, obwohl ich griechischer Abstammung war.",
          "Meine Beziehungen zu zwei mächtigen römischen Feldherren sind legendär.",
          "Mein Tod durch den Biss einer Schlange ist von Mythen umwoben.",
          "Ich war die letzte Pharaonin Ägyptens und die Geliebte von Julius Caesar und Marcus Antonius."
        ]
      },
      {
        keyword: "Ein Schwarzes Loch",
        tips: [
          "Meine Existenz wurde lange nur theoretisch diskutiert, basierend auf der allgemeinen Relativitätstheorie.",
          "Meine Anziehungskraft ist so stark, dass nicht einmal Licht mir entkommen kann.",
          "Der Punkt, an dem es kein Zurück mehr gibt, wird als 'Ereignishorizont' bezeichnet.",
          "Ich bin ein kosmisches Objekt, das entsteht, wenn ein massereicher Stern kollabiert."
        ]
      },
      {
        keyword: "Frodo Beutlin",
        tips: [
          "Ich verließ mein Zuhause im Auenland mit einem Ring, den ich von meinem Onkel geerbt hatte.",
          "Auf meiner Reise wurde ich von meinem treuen Gärtner Sam begleitet.",
          " Meine Aufgabe war es, den 'Einen Ring' im Feuer des Schicksalsberges zu vernichten.",
          "Ich bin der zentrale Held in 'Der Herr der Ringe'."
        ]
      },
      {
        keyword: "Han Solo",
        tips: [
          "Ich begann meine Karriere als einfacher Schmuggler mit einem sehr schnellen Raumschiff.",
          "Mein treuester Begleiter ist ein zotteliger Wookiee namens Chewbacca.",
          "Ich habe den Kessel-Flug in weniger als 12 Parsec geschafft.",
          "Ich bin der Kapitän des Millennium Falken und half Luke Skywalker im Kampf gegen das Imperium."
        ]
      },
      {
        keyword: "Die Erdatmosphäre",
        tips: [
          "Ich bestehe hauptsächlich aus Stickstoff und Sauerstoff.",
          "Ohne mich wäre der Himmel immer schwarz und Geräusche könnten sich nicht ausbreiten.",
          "Ich schütze die Erde vor gefährlicher Strahlung aus dem All.",
          "Ich bin die Lufthülle, die unseren Planeten umgibt und die wir zum Atmen brauchen."
        ]
      },
      {
        keyword: "Der Eiffelturm",
        tips: [
          "Ich wurde von vielen Pariser Künstlern anfangs als 'tragische Straßenlaterne' und nutzloser Schandfleck beschimpft.",
          "Mein Erbauer war ein Spezialist für Brückenbau und Eisenkonstruktionen.",
          "Ich war fast 41 Jahre lang das höchste Bauwerk der Welt, bis mich das Chrysler Building in New York übertraf.",
          "Ich bin das eiserne Wahrzeichen von Paris und wurde für die Weltausstellung 1889 erbaut."
        ]
      },
      {
        keyword: "Nelson Mandela",
        tips: [
          "Während meiner Zeit als politischer Gefangener erhielt ich die Häftlingsnummer 466/64.",
          "Ich verbrachte 27 Jahre meines Lebens auf der Gefängnisinsel Robben Island und in anderen Haftanstalten.",
          "Nach meiner Freilassung wurde ich der erste demokratisch gewählte, schwarze Präsident meines Landes.",
          "Ich bin eine südafrikanische Ikone des Kampfes gegen die Apartheid."
        ]
      },
      {
        keyword: "Mount Everest",
        tips: [
          "In den lokalen Sprachen nennt man mich 'Sagarmatha' oder 'Chomolungma'.",
          "Meine exakte Höhe ist immer wieder Gegenstand von neuen Messungen und internationalen Debatten.",
          "Die offizielle Erstbesteigung gelang 1953 einem Neuseeländer und einem Sherpa.",
          "Ich bin der höchste Berg der Welt und liege im Himalaya-Gebirge."
        ]
      },
      {
        keyword: "Das Kaugummi",
        tips: [
          "Meine Form wurde durch das Kauen von Harzen prähistorischer Bäume inspiriert.",
          "Ein amerikanischer Erfinder namens William Wrigley machte mich durch aggressive Werbung weltweit populär.",
          "Ich werde oft verwendet, um den Atem zu erfrischen oder um bei Druckausgleich im Flugzeug zu helfen.",
          "Ich bin eine süße, elastische Masse, die man kaut, aber normalerweise nicht herunterschluckt."
        ]
      },
      {
        keyword: "Apple Inc.",
        tips: [
          "Ich wurde in einer kleinen Garage in Cupertino, Kalifornien, gegründet.",
          "Mein erstes Logo zeigte Isaac Newton unter einem Baum sitzend.",
          "Einer meiner Gründer, eine visionäre Figur in einem schwarzen Rollkragenpullover, hat die Tech-Welt revolutioniert.",
          "Ich stelle das iPhone, das MacBook und viele andere Geräte mit einem angebissenen Apfel als Logo her."
        ]
      },
      {
        keyword: "Die Chinesische Mauer",
        tips: [
          "Entgegen einem weit verbreiteten Mythos bin ich vom Mond aus nicht mit bloßem Auge sichtbar.",
          "Meine Hauptfunktion war die Verteidigung gegen nomadische Reitervölker aus dem Norden.",
          "Der Bau meiner verschiedenen Abschnitte erstreckte sich über mehrere chinesische Dynastien.",
          "Ich bin ein gigantisches Befestigungssystem, das sich über Tausende von Kilometern durch Asien zieht."
        ]
      },
      {
        keyword: "Martin Luther King Jr.",
        tips: [
          "Ich überlebte 1958 ein Attentat, bei dem eine Frau einen Brieföffner in meine Brust stieß.",
          "Meine berühmteste Rede hielt ich während des 'Marsches auf Washington für Arbeit und Freiheit'.",
          "Ich war ein Baptistenpastor und eine zentrale Figur der amerikanischen Bürgerrechtsbewegung.",
          "Mein Traum war eine Nation, in der Menschen nicht nach ihrer Hautfarbe beurteilt werden ('I Have a Dream')."
        ]
      },
      {
        keyword: "Die Große Sphinx von Gizeh",
        tips: [
          "Meine Nase wurde im Laufe der Geschichte stark beschädigt, aber nicht durch Napoleons Truppen, wie eine Legende besagt.",
          "Über meinen genauen Zweck und den Erbauer herrscht unter Ägyptologen bis heute keine vollständige Einigkeit.",
          "Ich bin eine kolossale Statue mit dem Körper eines Löwen und dem Kopf eines Menschen.",
          "Ich wache seit Jahrtausenden über die Pyramiden von Gizeh."
        ]
      }
    ]
  },

  higherOrLower: {
    rounds: 3
  },

  jeopardy: {
    categories: [
      {
        name: "GeoGuessr",
        questions: [
          { points: 100, question: "In welchem Land liegt die Stadt mit der Skyline von Burj Khalifa?", answer: "Dubai" },
          { points: 200, question: "Auf welchem Kontinent liegen die Victoriafälle?", answer: "Afrika" },
          { points: 300, question: "Welcher Staat hat die meisten Zeitzonen?", answer: "Russland" },
          { points: 400, question: "Welches Gebirge trennt Europa und Asien voneinander?", answer: "Ural" },
          { points: 500, question: "Welches Land hat die längste Küstenlinie der Welt?", answer: "Kanada" }
        ]
      },
      {
        name: "Spitznamen-Rätsel",
        questions: [
          { points: 100, question: "Welcher verstorbene Sänger wurde 'King of Pop' genannt?", answer: "Michael Jackson" },
          { points: 200, question: "Welche deutsche Politikerin wurde jahrelang, oft liebevoll-rionisch 'Mutti' genannt?", answer: "Angela Merkel" },
          { points: 300, question: "Welche legendäre Persönlichkeit wird 'Schumi' genannt?", answer: "Michael Schumacher" },
          { points: 400, question: "Welche Stadt trägt auch den Namen 'Sin City'?", answer: "Las Vegas" },
          { points: 500, question: "Welches Land wird auch 'Land Down Under' genannt?", answer: "Australien" }
        ]
      },
      {
        name: "Kulinarische Weltreise",
        questions: [
          { points: 100, question: "Das Land ist berühmt für seine Teigwaren in allen Formen und eine runde, belegte Fladenbrotspeise. \n Welches Land ist gesucht?", answer: "Italien" },
          { points: 200, question: "In diesem Land isst man rohen Fisch auf kleinen Reisbällchen, oft serviert mit eingelegtem Ingwer und einer scharfen grünen Paste. \n  Welches Land ist gesucht?", answer: "Japan" },
          { points: 300, question: "Der süße Sirup aus dem Saft eines bestimmten Baumes, dessen Blatt auch auf der Nationalflagge zu sehen ist, ist das Markenzeichen dieses Landes. \n Welches Land ist gesucht?", answer: "Kanada" },
          { points: 400, question: "Das Nationalgericht ist ein kräftiger Eintopf aus Fleisch und Bohnen, der seinen Namen von der scharfen Schote hat, die ihm die Würze verleiht. \n  Welches Land ist gesucht?", answer: "Mexiko" },
          { points: 500, question: "Hier tunkt man an kalten Winterabenden Brotstücke in einen großen Topf mit geschmolzenem Käse. \n Welches Land ist gesucht?", answer: "Schweiz" }
        ]
      },
      {
        name: "Verbindung gesucht!",
        questions: [
          { points: 100, question: "Berlin, Paris, Rom, Madrid. Was ist die Verbindung?", answer: "Hauptstädte Europas" },
          { points: 200, question: "Ein gelber Schwamm, ein rosa Seestern, ein mürrischer Tintenfisch. Was ist die Verbindung?", answer: "SpongeBob Charaktere" },
          { points: 300, question: "Ein Vogel, ein Flugzeug, ein großes Gebäude. Was ist die Verbindung?", answer: "Der Flügel" },
          { points: 400, question: "Captain Jack Sparrow, Willy Wonka, Edward mit den Scherenhänden. Was ist die Verbindung?", answer: "Der Schauspieler Johnny Depp" },
          { points: 500, question: "Die Sportmarke 'Nike', der Paketdienst 'Hermes' und die Filmproduktionsfirma 'Orion Pictures'. Was ist die Verbindung?", answer: "1912" }
        ]
      },
      {
        name: "Das kenn ich doch!?",
        questions: [
          { points: 100, question: "'Just Do It.' - Zu welcher Marke gehört dieser Slogan?", answer: "Nike" },
          { points: 200, question: "'Ich bin doch nicht blöd!' - Zu welcher Marke gehört dieser Slogan?", answer: "Media Markt" },
          { points: 300, question: "'Wohnst du noch oder lebst du schon?' -  Zu welcher Marke gehört dieser Slogan?", answer: "IKEA" },
          { points: 400, question: "'Quadratisch. Praktisch. Gut.' - Zu welcher Marke gehört dieser Slogan?", answer: "Ritter Sport" },
          { points: 500, question: "'Die zarteste Versuchung, seit es Schokolade gibt.' - Zu welcher Marke gehört dieser Slogan?", answer: "Milka" }
        ]
      },
      {
        name: "Kurzgesagt",
        questions: [
          { points: 100, question: "Ein junger Löwe muss seinen Platz als König zurückerobern, nachdem sein böser Onkel die Macht an sich gerissen hat. Welcher Film ist das?", answer: "Der König der Löwen" },
          { points: 200, question: "Ein Bauernjunge vom Wüstenplaneten wird zum Weltraum-Ritter und bekämpft ein böses Imperium, das von seinem Vater angeführt wird. Welcher Film ist das?", answer: "Star Wars: Eine neue Hoffnung" },
          { points: 300, question: "Ein reicher alter Mann klont Dinosaurier für einen Vergnügungspark, was sich als katastrophal schlechte Idee herausstellt. Welcher Film ist das?", answer: "Jurassic Park" },
          { points: 400, question: "Zwei Auftragskiller führen philosophische Gespräche über Fußmassagen und Burger, während sie die schmutzige Arbeit für ihren Boss erledigen. Welcher Film ist das?", answer: "Pulp Fiction" },
          { points: 500, question: "Eine Gruppe von Dieben stiehlt keine Objekte, sondern wertvolle Ideen, indem sie in die Träume ihrer Opfer eindringen. Welcher Film ist das?", answer: "Inception" }
        ]
      }
    ]
  }
};

module.exports = gameConfig;
