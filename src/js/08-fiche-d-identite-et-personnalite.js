/* ============ v286 : FICHE D'IDENTITÉ ET PERSONNALITÉ MÉDIATIQUE ============
   g.bio = { ct: ville natale, h: taille (cm), w: poids (kg), lf: 1 si gaucher, pm: personnalité médiatique }.
   La personnalité est tirée parmi celles qui collent au golfeur (âge, talent, potentiel, régularité, nation…) ;
   à chaque intersaison, si elle ne colle plus (ex. Enfant prodige devenu vétéran), une nouvelle est tirée.
   Aucun effet sur le jeu : elle colore ses citations dans les nouvelles. */
const BIO_CITIES = {
  US: ['Orlando, FL', 'Dallas, TX', 'Austin, TX', 'Houston, TX', 'Scottsdale, AZ', 'Phoenix, AZ', 'San Diego, CA', 'Los Angeles, CA', 'Sacramento, CA', 'Palm Springs, CA', 'Las Vegas, NV', 'Denver, CO', 'Seattle, WA', 'Portland, OR', 'Chicago, IL', 'Columbus, OH', 'Cleveland, OH', 'Detroit, MI', 'Minneapolis, MN', 'Atlanta, GA', 'Augusta, GA', 'Charlotte, NC', 'Pinehurst, NC', 'Raleigh, NC', 'Charleston, SC', 'Myrtle Beach, SC', 'Jacksonville, FL', 'Tampa, FL', 'Miami, FL', 'Jupiter, FL', 'Nashville, TN', 'Memphis, TN', 'Louisville, KY', 'Birmingham, AL', 'Oklahoma City, OK', 'Tulsa, OK', 'Kansas City, MO', 'St. Louis, MO', 'Omaha, NE', 'Salt Lake City, UT', 'Boise, ID', 'Boston, MA', 'Philadelphia, PA', 'Pittsburgh, PA', 'New York, NY', 'Rochester, NY', 'Baltimore, MD', 'Richmond, VA', 'Honolulu, HI', 'Spokane, WA'],
  ENG: ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 'Sheffield', 'Bristol', 'Nottingham', 'Southampton', 'Newcastle', 'Brighton', 'Leicester', 'Coventry', 'Reading', 'Sunningdale', 'Wentworth', 'Southport', 'Hoylake', 'Sandwich', 'Bath', 'York', 'Cambridge', 'Oxford', 'Norwich', 'Exeter'],
  SCO: ['Edinburgh', 'Glasgow', 'Aberdeen', 'Dundee', 'St Andrews', 'Inverness', 'Perth', 'Troon', 'Carnoustie', 'North Berwick', 'Gullane', 'Stirling', 'Ayr', 'Dornoch', 'Kirkcaldy'],
  AUS: ['Melbourne', 'Sydney', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Hobart', 'Newcastle', 'Geelong', 'Townsville', 'Cairns', 'Darwin', 'Sunshine Coast', 'Wollongong'],
  KOR: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Jeju', 'Seongnam', 'Goyang', 'Yongin', 'Changwon'],
  JPN: ['Tokyo', 'Osaka', 'Nagoya', 'Yokohama', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Hiroshima', 'Sendai', 'Chiba', 'Shizuoka', 'Okayama', 'Kumamoto', 'Kagoshima', 'Naha'],
  SWE: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Helsingborg', 'Halmstad', 'Örebro', 'Linköping', 'Västerås', 'Jönköping', 'Umeå', 'Kristianstad', 'Falsterbo'],
  CAN: ['Montréal, QC', 'Québec, QC', 'Laval, QC', 'Terrebonne, QC', 'Gatineau, QC', 'Sherbrooke, QC', 'Trois-Rivières, QC', 'Saguenay, QC', 'Lévis, QC', 'Longueuil, QC', 'Blainville, QC', 'Rimouski, QC', 'Toronto, ON', 'Ottawa, ON', 'Mississauga, ON', 'Hamilton, ON', 'London, ON', 'Oakville, ON', 'Kitchener, ON', 'Vancouver, BC', 'Victoria, BC', 'Kelowna, BC', 'Calgary, AB', 'Edmonton, AB', 'Winnipeg, MB', 'Regina, SK', 'Saskatoon, SK', 'Halifax, NS', 'Moncton, NB', "St. John's, NL", 'Charlottetown, PE'],
  ESP: ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Málaga', 'Bilbao', 'Santander', 'Pamplona', 'Zaragoza', 'Marbella', 'Palma', 'Murcia', 'Oviedo', 'Castellón', 'Las Palmas'],
  RSA: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'George', 'Stellenbosch', 'East London', 'Polokwane', 'Pietermaritzburg', 'Nelspruit'],
  IRL: ['Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford', 'Kilkenny', 'Killarney', 'Sligo', 'Wexford', 'Athlone', 'Drogheda', 'Tralee'],
  NIR: ['Belfast', 'Holywood', 'Portrush', 'Newcastle', 'Derry', 'Lisburn', 'Bangor', 'Armagh', 'Enniskillen', 'Ballymena', 'Newry'],
  FRA: ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse', 'Nice', 'Nantes', 'Lille', 'Strasbourg', 'Montpellier', 'Rennes', 'Biarritz', 'Grenoble', 'Dijon', 'Reims', 'Le Touquet', 'Saint-Étienne', 'Cannes', 'Pau', 'Annecy'],
  GER: ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Leipzig', 'Hanover', 'Bremen', 'Nuremberg', 'Dresden', 'Bad Saarow', 'Heidelberg', 'Mainz'],
  DEN: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg', 'Vejle', 'Randers', 'Horsens', 'Kolding', 'Silkeborg', 'Roskilde'],
  NZL: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Tauranga', 'Dunedin', 'Queenstown', 'Napier', 'Palmerston North', 'Rotorua', 'Nelson'],
  ARG: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'Mar del Plata', 'La Plata', 'Tucumán', 'Salta', 'Santa Fe', 'Neuquén'],
  THA: ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Hua Hin', 'Khon Kaen', 'Nakhon Ratchasima', 'Udon Thani', 'Hat Yai'],
  ITA: ['Rome', 'Milan', 'Turin', 'Florence', 'Naples', 'Bologna', 'Venice', 'Verona', 'Genoa', 'Bergamo', 'Padua', 'Palermo', 'Como'],
  WAL: ['Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Bridgend', 'Llanelli', 'Aberystwyth', 'Bangor', 'Porthcawl'],
  MEX: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Cancún', 'Mérida', 'Querétaro', 'León', 'Tijuana', 'San Luis Potosí', 'Los Cabos'],
  TPE: ['Taipei', 'Kaohsiung', 'Taichung', 'Tainan', 'Taoyuan', 'Hsinchu', 'Keelung', 'Chiayi'],
  BEL: ['Brussels', 'Antwerp', 'Ghent', 'Bruges', 'Liège', 'Leuven', 'Namur', 'Mons', 'Knokke', 'Waterloo'],
  NED: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven', 'Groningen', 'Haarlem', 'Breda', 'Nijmegen', 'Maastricht', 'Zwolle'],
  AUT: ['Vienna', 'Salzburg', 'Graz', 'Innsbruck', 'Linz', 'Klagenfurt', 'Villach', 'Bregenz', 'Kitzbühel'],
  SUI: ['Zurich', 'Geneva', 'Basel', 'Lausanne', 'Bern', 'Lucerne', 'Lugano', 'St. Gallen', 'Crans-Montana', 'Neuchâtel'],
  FIN: ['Helsinki', 'Espoo', 'Tampere', 'Turku', 'Oulu', 'Jyväskylä', 'Lahti', 'Kuopio', 'Vaasa'],
  NOR: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Kristiansand', 'Tromsø', 'Drammen', 'Fredrikstad', 'Ålesund'],
  COL: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Santa Marta'],
  CHI: ['Santiago', 'Valparaíso', 'Viña del Mar', 'Concepción', 'La Serena', 'Antofagasta', 'Temuco'],
  VEN: ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Mérida'],
  PHI: ['Manila', 'Quezon City', 'Cebu City', 'Davao City', 'Makati', 'Baguio', 'Iloilo City'],
  IND: ['New Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Chandigarh', 'Ahmedabad', 'Jaipur', 'Gurgaon', 'Lucknow'],
  CHN: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Xiamen', 'Hangzhou', 'Chengdu', 'Kunming', 'Nanjing', 'Wuhan', 'Qingdao', 'Haikou'],
  SIN: ['Singapore'], CZE: ['Prague', 'Brno', 'Ostrava', 'Plzeň', 'Olomouc', 'Karlovy Vary'], POR: ['Lisbon', 'Porto', 'Faro', 'Braga', 'Coimbra', 'Vilamoura', 'Cascais'],
  MAS: ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Ipoh', 'Kota Kinabalu', 'Kuching', 'Malacca'], INA: ['Jakarta', 'Surabaya', 'Bandung', 'Bali', 'Medan', 'Semarang', 'Yogyakarta'],
  BRA: ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Porto Alegre', 'Curitiba', 'Brasília', 'Salvador', 'Florianópolis', 'Recife'], UAE: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Al Ain'],
  HKG: ['Hong Kong'], POL: ['Warsaw', 'Kraków', 'Gdańsk', 'Wrocław', 'Poznań', 'Łódź'], HUN: ['Budapest', 'Debrecen', 'Szeged', 'Pécs', 'Győr'], SVK: ['Bratislava', 'Košice', 'Žilina'],
  SLO: ['Ljubljana', 'Maribor', 'Bled', 'Koper'], GRE: ['Athens', 'Thessaloniki', 'Patras', 'Heraklion'], TUR: ['Istanbul', 'Ankara', 'Antalya', 'Izmir', 'Belek', 'Bursa'],
  ISL: ['Reykjavík', 'Akureyri', 'Kópavogur'], LUX: ['Luxembourg', 'Esch-sur-Alzette'], CYP: ['Nicosia', 'Limassol', 'Paphos', 'Larnaca'], MLT: ['Valletta', 'Sliema', 'Mdina'],
  MON: ['Monaco'], LIE: ['Vaduz', 'Schaan'], AND: ['Andorra la Vella', 'Escaldes-Engordany'], SMR: ['San Marino'], URU: ['Montevideo', 'Punta del Este', 'Salto'],
  CRC: ['San José', 'Liberia', 'Alajuela', 'Heredia'], PAN: ['Panama City', 'Colón', 'David'], DOM: ['Santo Domingo', 'Santiago de los Caballeros', 'Punta Cana', 'La Romana'],
  BAH: ['Nassau', 'Freeport'], BAR: ['Bridgetown', 'Holetown'], JAM: ['Kingston', 'Montego Bay', 'Ocho Rios'], TRI: ['Port of Spain', 'San Fernando'], PUR: ['San Juan', 'Ponce', 'Dorado', 'Mayagüez'],
  MRI: ['Port Louis', 'Curepipe'], KEN: ['Nairobi', 'Mombasa', 'Kisumu'], ZIM: ['Harare', 'Bulawayo'], MAR: ['Rabat', 'Casablanca', 'Marrakech', 'Agadir', 'Tangier'], EGY: ['Cairo', 'Alexandria', 'Sharm El Sheikh'],
  TUN: ['Tunis', 'Sousse', 'Hammamet'], SEN: ['Dakar', 'Saint-Louis'], GHA: ['Accra', 'Kumasi'], NGR: ['Lagos', 'Abuja', 'Port Harcourt'], UGA: ['Kampala', 'Entebbe'], TAN: ['Dar es Salaam', 'Arusha', 'Zanzibar'],
  NAM: ['Windhoek', 'Swakopmund'], ZAM: ['Lusaka', 'Ndola'], BOT: ['Gaborone', 'Francistown'], ISR: ['Tel Aviv', 'Jerusalem', 'Haifa', 'Caesarea'], JOR: ['Amman', 'Aqaba'], LIB: ['Beirut', 'Byblos'],
  KSA: ['Riyadh', 'Jeddah', 'Dammam'], QAT: ['Doha'], OMA: ['Muscat', 'Salalah'], KUW: ['Kuwait City'], BRN: ['Manama'], KAZ: ['Almaty', 'Astana', 'Shymkent'], UZB: ['Tashkent', 'Samarkand'],
  PAK: ['Karachi', 'Lahore', 'Islamabad'], BAN: ['Dhaka', 'Chittagong'], SRI: ['Colombo', 'Kandy', 'Galle'], NEP: ['Kathmandu', 'Pokhara'], CAM: ['Phnom Penh', 'Siem Reap'], LAO: ['Vientiane', 'Luang Prabang'],
  MGL: ['Ulaanbaatar'], FIJ: ['Suva', 'Nadi'], PNG: ['Port Moresby', 'Lae'], GUM: ['Hagåtña', 'Tamuning'], NCA: ['Nouméa'], PYF: ['Papeete'], BER: ['Hamilton', "St. George's"], CAY: ['George Town'],
  IVB: ['Road Town'], ANT: ["St. John's"], LCA: ['Castries'], GRN: ["St. George's"], SKN: ['Basseterre'], BIZ: ['Belize City', 'Belmopan'], ECU: ['Quito', 'Guayaquil', 'Cuenca'], PER: ['Lima', 'Arequipa', 'Cusco'],
  BOL: ['La Paz', 'Santa Cruz', 'Cochabamba'], PAR: ['Asunción', 'Ciudad del Este'], CUB: ['Havana', 'Santiago de Cuba', 'Varadero'], HON: ['Tegucigalpa', 'San Pedro Sula'], GUA: ['Guatemala City', 'Antigua Guatemala'],
  ESA: ['San Salvador', 'Santa Ana'], NIC: ['Managua', 'León'], HAI: ['Port-au-Prince', 'Cap-Haïtien'], GUY: ['Georgetown'], SUR: ['Paramaribo'], RUS: ['Moscow', 'Saint Petersburg', 'Sochi', 'Kazan'],
  UKR: ['Kyiv', 'Lviv', 'Odesa', 'Kharkiv'], ROU: ['Bucharest', 'Cluj-Napoca', 'Timișoara', 'Brașov'], VIE: ['Hanoi', 'Ho Chi Minh City', 'Da Nang'], ETH: ['Addis Ababa'], IRI: ['Tehran', 'Isfahan', 'Shiraz'],
  IRQ: ['Baghdad', 'Erbil', 'Basra'], ALG: ['Algiers', 'Oran'], ANG: ['Luanda'], MOZ: ['Maputo', 'Beira'], MAD: ['Antananarivo'], CIV: ['Abidjan', 'Yamoussoukro'], CMR: ['Yaoundé', 'Douala'],
  NIG: ['Niamey'], BUR: ['Ouagadougou'], MLI: ['Bamako'], MAW: ['Lilongwe', 'Blantyre'], CHA: ["N'Djamena"], SOM: ['Mogadishu'], RWA: ['Kigali'], AFG: ['Kabul'], ALB: ['Tirana', 'Durrës'],
  ARM: ['Yerevan'], AZE: ['Baku'], BLR: ['Minsk'], BIH: ['Sarajevo', 'Mostar'], BRU: ['Bandar Seri Begawan'], BUL: ['Sofia', 'Plovdiv', 'Varna'], CRO: ['Zagreb', 'Split', 'Dubrovnik'],
  EST: ['Tallinn', 'Tartu'], GEO: ['Tbilisi', 'Batumi'], KGZ: ['Bishkek'], LAT: ['Riga', 'Jūrmala'], LBA: ['Tripoli', 'Benghazi'], LTU: ['Vilnius', 'Kaunas'], MDA: ['Chișinău'],
  MNE: ['Podgorica', 'Budva', 'Kotor'], MYA: ['Yangon', 'Mandalay'], PRK: ['Pyongyang'], MKD: ['Skopje', 'Ohrid'], SRB: ['Belgrade', 'Novi Sad'], SUD: ['Khartoum'], SYR: ['Damascus', 'Aleppo'],
  TOG: ['Lomé'], TKM: ['Ashgabat'], YEM: ['Sanaa', 'Aden'], BEN: ['Cotonou', 'Porto-Novo'], BDI: ['Gitega', 'Bujumbura'], CPV: ['Praia', 'Mindelo'], CAF: ['Bangui'], COM: ['Moroni'], CGO: ['Brazzaville'],
  COD: ['Kinshasa', 'Lubumbashi'], DJI: ['Djibouti'], GEQ: ['Malabo'], ERI: ['Asmara'], SWZ: ['Mbabane', 'Manzini'], GAB: ['Libreville'], GAM: ['Banjul'], GUI: ['Conakry'], GBS: ['Bissau'],
  LES: ['Maseru'], LBR: ['Monrovia'], MTN: ['Nouakchott'], MYT: ['Mamoudzou'], REU: ['Saint-Denis', 'Saint-Pierre'], SHN: ['Jamestown'], STP: ['São Tomé'], SEY: ['Victoria'], SLE: ['Freetown'],
  SSD: ['Juba'], ESH: ['Laayoune'], FLK: ['Stanley'], GUF: ['Cayenne', 'Kourou'], BHU: ['Thimphu'], TLS: ['Dili'], MAC: ['Macau'], MDV: ['Malé'], TJK: ['Dushanbe'], AIA: ['The Valley'],
  ARU: ['Oranjestad'], BOE: ['Kralendijk'], CUW: ['Willemstad'], DMA: ['Roseau'], GLP: ['Pointe-à-Pitre', 'Basse-Terre'], MTQ: ['Fort-de-France'], MSR: ['Brades'], BLM: ['Gustavia'], MAF: ['Marigot'],
  VIN: ['Kingstown'], SXM: ['Philipsburg'], TCA: ['Providenciales', 'Cockburn Town'], ISV: ['Charlotte Amalie'], KOS: ['Pristina', 'Prizren'], ALA: ['Mariehamn'], AZO: ['Ponta Delgada'], FRO: ['Tórshavn'],
  GIB: ['Gibraltar'], GRL: ['Nuuk'], GGY: ['St Peter Port'], IMN: ['Douglas'], JEY: ['St Helier'], MDR: ['Funchal'], SPM: ['Saint-Pierre'], VAT: ['Vatican City'], PLE: ['Ramallah', 'Bethlehem'],
  ASA: ['Pago Pago'], COK: ['Avarua'], KIR: ['South Tarawa'], MHL: ['Majuro'], FSM: ['Palikir'], NRU: ['Yaren'], NIU: ['Alofi'], NMI: ['Saipan'], PLW: ['Koror'], RPN: ['Hanga Roa'], SAM: ['Apia'],
  SOL: ['Honiara'], TKL: ['Atafu'], TGA: ["Nuku'alofa"], TUV: ['Funafuti'], VAN: ['Port Vila'], WLF: ['Mata-Utu']
};
/* Personnalités : fr/en (étiquette), d (description), ok(g) (colle au golfeur ?), w(g) (poids du tirage),
   q (citations après une victoire), b (après un coup dur). */
const MEDIA = [
  { k: 'show', fr: 'Showman', en: 'Showman', d: 'Fait le spectacle, adore les caméras et célèbre chaque birdie.', de: 'Puts on a show, loves the cameras and celebrates every birdie.', w: g => 1 + Math.max(0, g.cl || 0) * 0.6,
    q: [['Les gens viennent pour voir du spectacle. Aujourd’hui, ils en ont eu pour leur argent !', 'People come for a show. Today they got their money’s worth!'], ['Avez-vous vu ce putt au 18 ? Je vais le revoir toute la soirée.', 'Did you see that putt on 18? I’ll be watching it all night.'], ['La foule m’a porté. Je joue pour eux.', 'The crowd carried me. I play for them.']],
    b: [['Même les meilleurs spectacles ont une mauvaise soirée. On se reprend la semaine prochaine.', 'Even the best shows have a bad night. We’ll bounce back next week.'], ['Je n’ai pas donné le show que les gens méritaient.', 'I didn’t give people the show they deserved.']] },
  { k: 'prov', fr: 'Provocateur', en: 'Provocateur', d: 'Lance des piques à ses rivaux et promet des victoires.', de: 'Takes shots at his rivals and promises wins.', w: g => g.a < 30 ? 1.3 : 0.8,
    q: [['Je l’avais dit. Les autres peuvent prendre des notes.', 'I said it. The others can take notes.'], ['Certains parlaient beaucoup cette semaine. Où sont-ils maintenant ?', 'Some guys were talking a lot this week. Where are they now?'], ['Ce n’était même pas mon meilleur golf. Imaginez quand ça va l’être.', 'That wasn’t even my best golf. Imagine when it is.']],
    b: [['Je ne vais pas faire semblant : le terrain était une farce cette semaine.', 'I won’t pretend: the course was a joke this week.'], ['Profitez-en. Ça n’arrivera pas deux fois.', 'Enjoy it. It won’t happen twice.']] },
  { k: 'franc', fr: 'Franc-parler', en: 'Straight shooter', d: 'Dit tout haut ce que les autres pensent tout bas.', de: 'Says out loud what others only think.', w: () => 1,
    q: [['J’ai bien joué, point. Pas besoin d’en faire un roman.', 'I played well, period. No need to write a novel about it.'], ['Honnêtement, les autres m’ont un peu aidé aujourd’hui.', 'Truthfully, the others helped me out a bit today.'], ['Je méritais celle-là. J’ai frappé mieux que tout le monde.', 'I deserved this one. I hit it better than everyone.']],
    b: [['J’ai mal joué. Il n’y a pas d’autre explication.', 'I played badly. There’s no other explanation.'], ['Les verts étaient injouables, et je ne suis pas le seul à le penser.', 'The greens were unplayable, and I’m not the only one who thinks so.']] },
  { k: 'vant', fr: 'Vantard', en: 'Braggart', d: 'Se compare aux légendes et parle de lui à la troisième personne.', de: 'Compares himself to the legends and talks about himself in the third person.', ok: g => g.o >= 550, w: () => 0.8,
    q: [['Il fallait bien que quelqu’un montre comment on fait.', 'Someone had to show them how it’s done.'], ['On parlera encore de cette ronde dans vingt ans.', 'They’ll still be talking about this round in twenty years.'], ['Les légendes ont gagné comme ça. Moi aussi, maintenant.', 'The legends won like this. Now so have I.']],
    b: [['Même un champion a droit à une semaine de congé.', 'Even a champion is allowed a week off.'], ['Ils me regarderont gagner la semaine prochaine.', 'They’ll watch me win next week.']] },
  { k: 'pol', fr: 'Polémiste', en: 'Controversial', d: 'Toujours une controverse ; adore débattre des règles du circuit.', de: 'Always a controversy; loves debating the tour’s rules.', w: () => 0.7,
    q: [['Le circuit devrait revoir son système de points, mais je ne me plaindrai pas aujourd’hui.', 'The tour should rethink its points system, but I won’t complain today.'], ['On dira que j’ai eu de la chance avec les départs. Qu’ils le disent.', 'They’ll say I got lucky with the tee times. Let them.'], ['Quelqu’un devait gagner malgré ce parcours mal préparé.', 'Somebody had to win despite that poorly prepared course.']],
    b: [['Ces positions de drapeau sont une honte. Je l’ai dit aux officiels.', 'Those pin positions were a disgrace. I told the officials.'], ['Il faudrait parler de l’heure de départ qu’on m’a donnée.', 'We should talk about the tee time they gave me.']] },
  { k: 'disc', fr: 'Discret', en: 'Low-key', d: 'Réponses courtes, fuit les micros.', de: 'Short answers, avoids the microphones.', w: () => 1.4,
    q: [['Content. Bonne semaine.', 'Happy. Good week.'], ['J’ai joué mon jeu. C’est tout.', 'I played my game. That’s all.'], ['Merci. Je vais rentrer à la maison.', 'Thanks. I’m going home.']],
    b: [['Pas ma semaine.', 'Not my week.'], ['Rien à ajouter.', 'Nothing to add.']] },
  { k: 'myst', fr: 'Mystérieux', en: 'Enigmatic', d: 'On sait peu de choses de lui ; il donne rarement des entrevues.', de: 'Little is known about him; he rarely gives interviews.', w: () => 0.6,
    q: [['Certaines choses ne s’expliquent pas. Elles se jouent.', 'Some things can’t be explained. They’re played.'], ['Vous saurez peut-être un jour pourquoi cette semaine était spéciale.', 'Maybe one day you’ll know why this week was special.'], ['…', '…']],
    b: [['Le golf garde ses secrets.', 'Golf keeps its secrets.'], ['Je reviendrai.', 'I’ll be back.']] },
  { k: 'tim', fr: 'Timide', en: 'Shy', d: 'Mal à l’aise devant la caméra, mais attachant.', de: 'Uncomfortable in front of the camera, but endearing.', ok: g => g.a <= 30, w: g => g.a <= 24 ? 1.4 : 0.8,
    q: [['Euh… je ne sais pas trop quoi dire. Merci à tout le monde.', 'Um… I don’t really know what to say. Thanks, everyone.'], ['Je suis encore sous le choc, pour être franc.', 'I’m still in shock, to be honest.'], ['Je préfère frapper des balles que parler, désolé.', 'I’d rather hit balls than talk, sorry.']],
    b: [['C’était difficile… j’ai appris beaucoup.', 'It was tough… I learned a lot.'], ['Je vais travailler plus fort.', 'I’ll work harder.']] },
  { k: 'stoi', fr: 'Stoïque', en: 'Stoic', d: 'Aucune émotion ; gagne ou perd avec le même visage.', de: 'No emotion; wins or loses with the same face.', ok: g => regLevel(g) >= 3 || (g.cl || 0) >= 1, w: g => 0.6 + (regLevel(g) - 3) * 0.4 + Math.max(0, g.cl || 0) * 0.3,
    q: [['Un coup à la fois. Le résultat suit.', 'One shot at a time. The result follows.'], ['C’est un tournoi de plus. Demain, je retourne au travail.', 'It’s one more tournament. Tomorrow I go back to work.'], ['Je n’ai pas regardé le classement. Je ne le regarde jamais.', 'I didn’t look at the leaderboard. I never do.']],
    b: [['Ça arrive. On continue.', 'It happens. We move on.'], ['Le score ne change rien à la méthode.', 'The score doesn’t change the process.']] },
  { k: 'fav', fr: 'Favori du public', en: 'Fan favorite', d: 'Signe tous les autographes ; adoré partout où il passe.', de: 'Signs every autograph; loved everywhere he goes.', ok: g => g.o >= 450, w: () => 1.4,
    q: [['Cette victoire est pour les fans. Ils étaient là à chaque trou.', 'This win is for the fans. They were there on every hole.'], ['Je vais rester signer des autographes jusqu’au dernier.', 'I’ll stay and sign autographs until the last one.'], ['Entendre la foule au 18, c’est pour ça que je joue.', 'Hearing the crowd on 18 is why I play.']],
    b: [['Désolé aux gens qui sont venus me voir. Je vais me reprendre.', 'Sorry to the people who came to see me. I’ll make it up to them.'], ['Les fans m’ont encouragé jusqu’à la fin, même dans une mauvaise semaine.', 'The fans cheered me to the end, even in a bad week.']] },
  { k: 'blag', fr: 'Blagueur', en: 'Jokester', d: 'Une pointe d’humour à chaque entrevue.', de: 'A bit of humor in every interview.', w: () => 1.1,
    q: [['Mon caddie dit que c’est grâce à lui. Je vais le laisser croire ça.', 'My caddie says it was all him. I’ll let him believe that.'], ['J’ai finalement trouvé le fairway. Il était là depuis le début !', 'I finally found the fairway. It was there all along!'], ['Je vais devoir acheter un plus gros salon pour le trophée.', 'I’ll need a bigger living room for the trophy.']],
    b: [['J’ai visité plus de bunkers qu’un guide touristique cette semaine.', 'I visited more bunkers than a tour guide this week.'], ['Au moins, mes balles ont vu du pays.', 'At least my golf balls saw the world.']] },
  { k: 'gent', fr: 'Gentleman', en: 'Gentleman', d: 'Modeste et respectueux ; félicite toujours ses adversaires.', de: 'Modest and respectful; always congratulates his opponents.', w: () => 1.1,
    q: [['Les autres ont joué du très beau golf. J’ai eu un peu de chance.', 'The others played beautiful golf. I got a little lucky.'], ['Merci au personnel du terrain : le parcours était parfait.', 'Thanks to the grounds crew: the course was perfect.'], ['Bravo à tout le champ. Ce fut un privilège.', 'Well played to the whole field. It was a privilege.']],
    b: [['Félicitations au gagnant, il le méritait.', 'Congratulations to the winner, he deserved it.'], ['Je dois m’améliorer, tout simplement.', 'I simply have to get better.']] },
  { k: 'amb', fr: 'Ambassadeur', en: 'Ambassador', d: 'Représente fièrement son pays sur le circuit.', de: 'Proudly represents his country on the tour.', ok: g => !BIO_BIG.has(natCode(g.nat)), w: () => 1.3,
    q: [['Je pense à tous les jeunes golfeurs de chez nous. Tout est possible.', 'I’m thinking of all the young golfers back home. Anything is possible.'], ['Ce trophée fera le tour du pays.', 'This trophy is going on a tour of the country.'], ['On n’est pas nombreux sur le circuit, mais on est là.', 'There aren’t many of us on tour, but we’re here.']],
    b: [['J’aurais voulu faire mieux pour les gens de chez nous.', 'I wanted to do better for the people back home.'], ['Je porte mon pays avec moi, même dans les mauvaises semaines.', 'I carry my country with me, even in the bad weeks.']] },
  { k: 'ment', fr: 'Mentor', en: 'Mentor', d: 'Prend les recrues sous son aile.', de: 'Takes the rookies under his wing.', ok: g => g.a >= 33, w: g => g.a >= 38 ? 2.4 : 1.6,
    q: [['J’espère que les jeunes ont regardé. Voilà comment on gère un dimanche.', 'I hope the young guys were watching. That’s how you handle a Sunday.'], ['Gagner, c’est bien. Transmettre, c’est mieux.', 'Winning is good. Passing it on is better.'], ['J’ai encore des choses à enseigner, apparemment !', 'Apparently I still have a few things to teach!']],
    b: [['Une leçon pour moi aussi : on n’arrête jamais d’apprendre.', 'A lesson for me too: you never stop learning.'], ['Les jeunes m’ont donné une leçon cette semaine.', 'The young guys taught me a lesson this week.']] },
  { k: 'phil', fr: 'Philanthrope', en: 'Philanthropist', d: 'Sa fondation et ses cliniques pour jeunes font souvent parler.', de: 'His foundation and junior clinics are often in the news.', ok: g => g.a >= 27 && g.o >= 550, w: () => 1.4,
    q: [['Une partie de la bourse ira à ma fondation. C’est ce qui compte.', 'Part of the purse goes to my foundation. That’s what matters.'], ['Les enfants de ma clinique m’ont écrit avant la ronde. Ça m’a porté.', 'The kids from my clinic wrote to me before the round. It lifted me.'], ['Le golf m’a tout donné. Je veux redonner.', 'Golf gave me everything. I want to give back.']],
    b: [['Il y a des choses plus importantes que le golf.', 'There are more important things than golf.'], ['Je vais quand même faire ma clinique lundi.', 'I’ll still run my clinic on Monday.']] },
  { k: 'perf', fr: 'Perfectionniste', en: 'Perfectionist', d: 'Jamais satisfait, même après une victoire.', de: 'Never satisfied, even after a win.', w: g => 0.8 + (regLevel(g) - 3) * 0.2,
    q: [['J’ai gagné, mais j’ai raté trois coups faciles. Je vais au champ de pratique.', 'I won, but I missed three easy shots. I’m heading to the range.'], ['Ce n’était pas propre. Il y a du travail à faire.', 'It wasn’t clean. There’s work to do.'], ['Une victoire n’efface pas un mauvais coup de fer.', 'A win doesn’t erase a bad iron shot.']],
    b: [['Inacceptable. Je vais tout revoir.', 'Unacceptable. I’ll go over everything.'], ['Chaque détail compte, et j’en ai négligé plusieurs.', 'Every detail matters, and I neglected several.']] },
  { k: 'bour', fr: 'Bourreau de travail', en: 'Grinder', d: 'Le premier au champ de pratique, le dernier parti.', de: 'First on the range, last to leave.', w: g => 0.7 + Math.max(0, (g.dv || 1) - 1),
    q: [['Toutes ces heures au champ de pratique, c’est pour des journées comme celle-ci.', 'All those hours on the range are for days like this.'], ['Je fête ce soir, mais demain matin je suis au putting green.', 'I’ll celebrate tonight, but tomorrow morning I’m on the putting green.'], ['Le talent, ça aide. Le travail, ça gagne.', 'Talent helps. Work wins.']],
    b: [['Retour au travail. Il n’y a pas de raccourci.', 'Back to work. There are no shortcuts.'], ['Je vais frapper 500 balles demain.', 'I’ll hit 500 balls tomorrow.']] },
  { k: 'anal', fr: 'Analytique', en: 'Analytical', d: 'Parle de statistiques, d’angles et de données.', de: 'Talks about stats, angles and data.', w: g => 0.7 + (g.sk ? (g.sk[1] - 3) * 0.2 : 0),
    q: [['Mes stats de fers étaient dans le top 5 du champ. Le résultat suit les chiffres.', 'My iron stats were top 5 in the field. The result follows the numbers.'], ['On avait un plan pour chaque drapeau. Il a fonctionné.', 'We had a plan for every pin. It worked.'], ['Gagné un peu plus de deux coups sur le champ avec le putter. C’est la clé.', 'Gained a bit over two strokes on the field with the putter. That’s the key.']],
    b: [['Les données disent que c’était de la malchance. Je vais quand même vérifier.', 'The data says it was bad luck. I’ll still double-check.'], ['Mes coups d’approche ont coûté trois coups. Facile à corriger.', 'My approach shots cost me three strokes. Easy to fix.']] },
  { k: 'emo', fr: 'Émotif', en: 'Emotional', d: 'Larmes à la victoire, frustration visible dans la défaite.', de: 'Tears in victory, visible frustration in defeat.', w: g => 0.7 + (3 - regLevel(g)) * 0.25,
    q: [['Je… je n’arrive pas à y croire. Donnez-moi une minute.', 'I… I can’t believe it. Give me a minute.'], ['Je pense à ma famille. Tout ce qu’ils ont sacrifié pour moi.', 'I’m thinking of my family. Everything they sacrificed for me.'], ['J’ai pleuré sur le 18. Je n’en ai pas honte.', 'I cried on 18. I’m not ashamed of it.']],
    b: [['Ça fait mal. Vraiment mal.', 'It hurts. It really hurts.'], ['J’ai cassé un bâton au 14. Pas fier de moi.', 'I broke a club on 14. Not proud of it.']] },
  { k: 'ranc', fr: 'Rancunier', en: 'Grudge holder', d: 'N’oublie jamais une défaite et garde ses rivaux en tête.', de: 'Never forgets a loss and keeps his rivals in mind.', w: () => 0.8,
    q: [['Je n’ai pas oublié la dernière fois. Maintenant, on est quittes.', 'I didn’t forget last time. Now we’re even.'], ['Certains m’avaient enterré. Je garde la liste.', 'Some people had written me off. I keep a list.'], ['Celle-là, je la dédie à ceux qui doutaient.', 'This one’s for the doubters.']],
    b: [['Je vais m’en souvenir.', 'I’ll remember this.'], ['Ils peuvent sourire. Leur tour viendra.', 'Let them smile. Their turn will come.']] },
  { k: 'sup', fr: 'Superstitieux', en: 'Superstitious', d: 'Rituels, balle fétiche et même chandail le dimanche.', de: 'Rituals, a lucky ball and the same shirt on Sunday.', w: () => 1,
    q: [['Même chandail, même balle, même déjeuner. On ne touche à rien.', 'Same shirt, same ball, same breakfast. We don’t change a thing.'], ['J’ai trouvé un trèfle à quatre feuilles mardi. Je l’avais dit à mon caddie.', 'I found a four-leaf clover on Tuesday. I told my caddie.'], ['Ma balle porte le numéro 3 depuis l’enfance. Elle ne m’a jamais laissé tomber.', 'My ball has been a number 3 since childhood. It never let me down.']],
    b: [['Mon caddie a marché sur une ligne de putt. Je n’en dis pas plus.', 'My caddie stepped on a putting line. I’ll say no more.'], ['Changer de balle mercredi, grosse erreur.', 'Switching balls on Wednesday was a big mistake.']] },
  { k: 'exc', fr: 'Excentrique', en: 'Eccentric', d: 'Vêtements flamboyants et habitudes étranges.', de: 'Flamboyant outfits and strange habits.', w: () => 0.8,
    q: [['Le pantalon à carreaux roses, c’était le bon choix.', 'The pink plaid pants were the right call.'], ['J’ai médité avec mon fer 7 avant la ronde. Ça marche.', 'I meditated with my 7-iron before the round. It works.'], ['Je joue mieux quand je fredonne. Désolé pour mes partenaires.', 'I play better when I hum. Sorry to my playing partners.']],
    b: [['Les chaussettes jaunes n’étaient pas une bonne idée.', 'The yellow socks were not a good idea.'], ['Mon putter et moi avons besoin de temps chacun de notre côté.', 'My putter and I need some time apart.']] },
  { k: 'philo', fr: 'Philosophe', en: 'Philosopher', d: 'Réponses profondes ; parle du golf comme d’un art.', de: 'Deep answers; talks about golf as an art.', ok: g => g.a >= 28, w: () => 1.1,
    q: [['Le golf, c’est accepter l’imperfection. Cette semaine, elle a été clémente.', 'Golf is accepting imperfection. This week, it was kind to me.'], ['On ne bat pas le terrain. On danse avec lui.', 'You don’t beat the course. You dance with it.'], ['La victoire n’est qu’un moment. Le chemin, lui, reste.', 'The win is just a moment. The journey stays.']],
    b: [['Le parcours m’a appris l’humilité, encore une fois.', 'The course taught me humility, once again.'], ['Sans défaite, la victoire n’aurait aucun goût.', 'Without defeat, victory would have no taste.']] },
  { k: 'old', fr: 'Old school', en: 'Old school', d: 'Nostalgique ; se méfie des modes et de la technologie.', de: 'Nostalgic; wary of trends and technology.', ok: g => g.a >= 35, w: g => g.a >= 40 ? 2 : 1.2,
    q: [['Pas de lecteur de vitesse, pas de données. Juste des sensations.', 'No launch monitor, no data. Just feel.'], ['On jouait comme ça dans le temps, et ça marche encore.', 'That’s how we played back in the day, and it still works.'], ['Mes fers ont quinze ans. Ils savent ce qu’ils font.', 'My irons are fifteen years old. They know what they’re doing.']],
    b: [['Les jeunes cognent fort, mais le golf, c’est autre chose.', 'The kids hit it hard, but golf is something else.'], ['Les terrains d’aujourd’hui ne pardonnent rien.', 'Today’s courses don’t forgive anything.']] },
  { k: 'infl', fr: 'Influenceur', en: 'Influencer', d: 'Vit sur les réseaux sociaux : vlogs et contenu viral.', de: 'Lives on social media: vlogs and viral content.', ok: g => g.a <= 32, w: g => g.a <= 26 ? 1.3 : 0.8,
    q: [['La vidéo de ma dernière ronde sort ce soir. Abonnez-vous !', 'The video of my final round drops tonight. Subscribe!'], ['Ma communauté a vécu chaque trou avec moi. Merci la gang !', 'My community lived every hole with me. Thanks, crew!'], ['Ce putt au 18 va devenir viral, c’est certain.', 'That putt on 18 is going viral for sure.']],
    b: [['Grosse semaine de contenu, petite semaine de golf.', 'Big content week, small golf week.'], ['Les commentaires vont être rough cette semaine.', 'The comments are going to be rough this week.']] },
  { k: 'fet', fr: 'Fêtard', en: 'Party animal', d: 'On parle autant de ses soirées que de son golf.', de: 'His nights out make as much news as his golf.', ok: g => g.a <= 34, w: () => 0.7,
    q: [['Ce soir, c’est moi qui paie la tournée !', 'Tonight, the drinks are on me!'], ['J’ai bien dormi, pour une fois. Ça paraît.', 'I actually slept well for once. It shows.'], ['Le trophée va voir du pays cette nuit.', 'The trophy is going to see the town tonight.']],
    b: [['Peut-être que mardi soir était de trop.', 'Maybe Tuesday night was one too many.'], ['On oublie ça au bar.', 'We’ll forget about it at the bar.']] },
  { k: 'glob', fr: 'Globe-trotteur', en: 'Globetrotter', d: 'Aventures et voyages entre les tournois.', de: 'Adventures and travels between tournaments.', w: () => 0.8,
    q: [['Après ça, je pars faire de la plongée une semaine. Bien mérité !', 'After this, I’m off scuba diving for a week. Well deserved!'], ['J’ai joué ce terrain dans ma tête pendant mon trek. Ça a payé.', 'I played this course in my head during my trek. It paid off.'], ['Prochaine destination : on verra où le vent me mène.', 'Next destination: we’ll see where the wind takes me.']],
    b: [['Le décalage horaire m’a rattrapé.', 'The jet lag caught up with me.'], ['Au moins, la région est magnifique.', 'At least the area is beautiful.']] },
  { k: 'rev', fr: 'Revanchard', en: 'Underdog', d: 'Sous-estimé, il le sait et joue avec quelque chose à prouver.', de: 'Underrated, he knows it and plays with something to prove.', ok: g => (g.pt || g.p) - g.p > 60 || g.o >= g.p - 20, w: () => 2.2,
    q: [['Les dépisteurs ne croyaient pas en moi. Je joue pour leur prouver qu’ils avaient tort.', 'The scouts didn’t believe in me. I play to prove them wrong.'], ['Personne ne m’attendait ici. C’est encore mieux comme ça.', 'Nobody expected me here. That makes it even better.'], ['On m’a toujours dit que je n’étais pas assez bon. Regardez maintenant.', 'They always told me I wasn’t good enough. Look now.']],
    b: [['Ils vont dire que j’ai retrouvé ma place. On verra.', 'They’ll say I’m back where I belong. We’ll see.'], ['Ça ne fait que remplir mon réservoir.', 'It only fills my tank.']] },
  { k: 'prod', fr: 'Enfant prodige', en: 'Prodigy', d: 'Des attentes énormes depuis son jeune âge ; suivi de près par les médias.', de: 'Huge expectations from a young age; closely followed by the media.', ok: g => g.a <= 25 && g.p >= 750, w: () => 3,
    q: [['Tout le monde attendait ça depuis longtemps. Moi le premier.', 'Everyone has been waiting for this for a long time. Me first.'], ['La pression ? J’ai grandi avec.', 'Pressure? I grew up with it.'], ['C’est juste le début.', 'This is just the beginning.']],
    b: [['On oublie parfois que j’ai seulement ' + '{a}' + ' ans.', 'People sometimes forget I’m only {a}.'], ['Les attentes sont lourdes certaines semaines.', 'The expectations are heavy some weeks.']] },
  { k: 'sage', fr: 'Vétéran sage', en: 'Wise veteran', d: 'Du recul et des anecdotes ; respecté de tous.', de: 'Perspective and stories; respected by everyone.', ok: g => g.a >= 36, w: g => g.a >= 40 ? 3 : 2,
    q: [['À mon âge, chaque victoire a un goût particulier.', 'At my age, every win tastes different.'], ['J’ai vu passer bien des générations. Je suis encore là.', 'I’ve seen many generations come and go. I’m still here.'], ['L’expérience, ça vaut quelques coups le dimanche.', 'Experience is worth a few strokes on Sunday.']],
    b: [['Le corps ne suit plus toujours la tête.', 'The body doesn’t always follow the mind anymore.'], ['J’en ai vu d’autres. Ça passera.', 'I’ve seen worse. It’ll pass.']] },
  { k: 'fam', fr: 'Homme de famille', en: 'Family man', d: 'Parle de ses enfants et de l’équilibre de vie.', de: 'Talks about his kids and work-life balance.', ok: g => g.a >= 27, w: g => g.a >= 32 ? 1.8 : 1.1,
    q: [['Mes enfants regardaient à la maison. C’est pour eux.', 'My kids were watching at home. This is for them.'], ['Ma femme m’a dit de jouer libéré. Elle a toujours raison.', 'My wife told me to play free. She’s always right.'], ['Je vais enfin pouvoir rentrer et dormir dans mon lit.', 'I finally get to go home and sleep in my own bed.']],
    b: [['Au moins, je vais être à la maison pour la fin de semaine.', 'At least I’ll be home for the weekend.'], ['Mes enfants s’en fichent de mon score. Ça remet les choses en perspective.', 'My kids don’t care about my score. It puts things in perspective.']] },
  { k: 'pat', fr: 'Patriote', en: 'Patriot', d: 'Vit pour son drapeau et les tournois disputés chez lui.', de: 'Lives for his flag and the tournaments played at home.', w: () => 0.9,
    q: [['Cette victoire, c’est pour mon pays.', 'This win is for my country.'], ['J’ai vu des drapeaux de chez nous dans la foule. Ça m’a donné des ailes.', 'I saw flags from home in the crowd. It gave me wings.'], ['Mon pays peut être fier ce soir.', 'My country can be proud tonight.']],
    b: [['J’ai laissé tomber les gens de chez nous cette semaine.', 'I let the people back home down this week.'], ['Je vais me reprendre pour mon pays.', 'I’ll bounce back for my country.']] }
];
const MEDIA_BY = {}; MEDIA.forEach(m => { MEDIA_BY[m.k] = m; });
const BIO_BIG = new Set(['US', 'ENG', 'SCO', 'AUS', 'JPN', 'KOR', 'SWE', 'CAN', 'ESP', 'RSA', 'IRL', 'NIR', 'FRA', 'GER']);
function natCode(name) { const n = NATIONS.find(x => x.name === name); return n ? n.code : ''; }
/* traductions : la source est en français, l'anglais passe par I18N_EN */
MEDIA.forEach(m => { I18N_EN[m.fr] = m.en; I18N_EN[m.d] = m.de; m.q.concat(m.b).forEach(([f, e]) => { if (!f.includes('{a}')) I18N_EN[f] = e; }); });
function mediaOk(m, g) { try { return !m.ok || !!m.ok(g); } catch (e) { return true; } }
function mediaPick(g) {
  const L = MEDIA.filter(m => mediaOk(m, g)), W = L.map(m => Math.max(0.05, m.w ? m.w(g) : 1));
  let r = Math.random() * W.reduce((a, b) => a + b, 0); for (let i = 0; i < L.length; i++) { r -= W[i]; if (r < 0) return L[i].k; } return L[L.length - 1].k;
}
function gauss1() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function bioRoll(g) {
  const c = natCode(g.nat), list = BIO_CITIES[c], N = NATIONS.find(x => x.name === g.nat), asia = N && N.region === 'asie';
  const h = Math.round(Math.max(160, Math.min(203, (asia ? 175 : 181) + gauss1() * 6.5)));
  const bmi = Math.max(20, Math.min(32, 25 + gauss1() * 2.3)), w = Math.round(bmi * (h / 100) * (h / 100));
  g.bio = { ct: list && list.length ? list[Math.floor(Math.random() * list.length)] : (g.nat || ''), h, w, lf: Math.random() < 0.1 ? 1 : 0, pm: mediaPick(g) };
  return g;
}
function bioEnsure(g) { if (g && !g.bio) bioRoll(g); return g; }
function bioSeason(g) {   // intersaison : une personnalité qui ne colle plus est remplacée ; rarement, elle évolue
  if (!g || !g.bio || g.bio.pl) return; const m = MEDIA_BY[g.bio.pm];   // pl : choisie par le commissaire, on n'y touche pas
  if (!m || !mediaOk(m, g) || Math.random() < 0.03) g.bio.pm = mediaPick(g);
}
function bioMigrate() { if (!S || S.biov === 1) return; Object.values(S.G).forEach(g => { if (g) bioEnsure(g); }); S.biov = 1; }
const fmtHt = h => { const t = Math.round(h / 2.54); return Math.floor(t / 12) + '\u2032' + (t % 12) + '\u2033'; };   // v287 : pieds et pouces, livres
const htIn = v => { const m = String(v || '').trim().match(/^(\d+)(?:['\u2032pi.,\s-]+(\d+))?/i); if (!m) return 0; const a = +m[1], b = m[2] != null ? +m[2] : null; const inch = b != null ? a * 12 + b : a < 10 ? a * 12 : a; return inch ? Math.round(inch * 2.54) : 0; };
const ftStr = h => { const t = Math.round(h / 2.54); return Math.floor(t / 12) + "'" + (t % 12); };
const fmtWt = w => Math.round(w * 2.2046) + '\u00a0lb';
function bioOf(id) { const g = S.G[id] || (S.old && S.old[id]); return g && g.bio ? g.bio : null; }
function mediaQuote(g, kind) {
  const b = g && g.bio, m = b && MEDIA_BY[b.pm]; if (!m) return null;
  const L = kind === 'b' ? m.b : m.q, x = L[Math.floor(Math.random() * L.length)];
  return x[0].replace('{a}', g.a);
}
function bioHTML(id) {
  const b = bioOf(id); if (!b) return '';
  const m = MEDIA_BY[b.pm];
  return '<div class="block biob"><div class="biog">' +
    '<div><span>Ville natale</span><b>' + esc(b.ct || '–') + '</b></div>' +
    '<div><span>Taille</span><b>' + fmtHt(b.h) + '</b></div>' +
    '<div><span>Poids</span><b>' + fmtWt(b.w) + '</b></div>' +
    '<div><span>Côté</span><b>' + (b.lf ? 'Gaucher' : 'Droitier') + '</b></div></div>' +
    (m ? '<div class="biom"><span class="biomt">🎤 <b>' + m.fr + '</b></span><span class="small mute">' + m.d + '</span></div>' : '') + '</div>';
}

function newGolfer(id, used, o, age) {
  age = age || randAge();
  const room = age < 24 ? 60 + Math.random() * 200 : age < 28 ? Math.random() * 90 : Math.random() * 25;
  const pk = clamp(Math.round(29 + gauss() * 2.4), 25, 35);
  const oo = clamp(o, 5, 995);
  const identity = makeGolferIdentity(used);
  const g = { id, n: identity.n, nat: identity.nat, a: age, o: oo, p: clamp(o + room, 50, 1000), f: 0, sl: 0, sm: 0, v: 1,
    pk, dr: Math.exp(gauss() * 0.32), ri: Math.exp(gauss() * 0.3), sg: 0, cs: 0,
    op: oo + (age > 31 ? (age - 31) * (4 + Math.random() * 8) : 0), cl: drawClutch() };
  initDev(g);
  newReg(g); talRoll(g, Math.max(0, age - 21)); skRoll(g); bioRoll(g);
  try { if (S && S.G && GFX.faces.length) { const k = phPick(g, phUsed()); if (k) g.ph = k; } } catch (e) { }   // v298 : une photo dès la création
  return g;
}
function newUniverse(playerName, startLeague, full) {   // full : 150 IA partout, sans place réservée au joueur (histoire présimulée)
  // le pool complet est tiré d'un coup sur la courbe de référence, puis trié par talent : les 150 meilleurs
  // partent en Ligue 1, les 150 suivants en Ligue 2, etc. — ce sont les golfeurs qui dictent les ligues, pas l'inverse.
  const used = new Set(), G = {}, L = [[], [], [], []]; let id = 1;
  const overalls = []; for (let i = 0; i < FIELD * 4 - (full ? 0 : 1); i++) overalls.push(drawOverall());
  overalls.sort((a, b) => b - a);
  let p = 0;
  for (let l = 0; l < 4; l++) {
    const n = (l === startLeague && !full) ? FIELD - 1 : FIELD;
    for (let i = 0; i < n; i++) {
      const g = newGolfer(id++, used, overalls[p++]);
      G[g.id] = g; L[l].push(g.id);
    }
  }
  if (!full && startLeague < 4) L[startLeague].push(0);
  return { G, L, nextId: id, used: Array.from(used) };
}

/* ---- Points ---- */
function defaultPts() {
  const t = [100, 80, 70, 65, 60, 55, 50, 45, 40, 35], out = [];
  for (let k = 1; k <= 75; k++) out.push(k <= 10 ? t[k - 1] : k <= 15 ? 30 : k <= 20 ? 26 : k <= 25 ? 23 : k <= 30 ? 20 : k <= 40 ? 16 : k <= 50 ? 12 : k <= 60 ? 8 : 4);
  return out;
}
let PTS = defaultPts(), MC_POINTS = 0;   // coupure rat\u00e9e : aucun point par d\u00e9faut
function setPoints(arr, mc) { PTS = (arr && arr.length) ? arr.slice() : defaultPts(); MC_POINTS = (mc == null ? 0 : mc); }
function pointsAt(k) { return PTS[Math.min(k, PTS.length) - 1]; }

/* ---- Coupure + classement final ---- */
function cutScoreOf(r1arr, size) { const s = r1arr.slice().sort((a, b) => a - b); return s[Math.min(size, s.length) - 1]; }
/* entries: [{id,r1,r2|null}] -> rows [id,pos,r1,r2,pts] (pos 0 = coupure) + gagnant */
function finalize(entries, po) {
  const made = entries.filter(e => e.r2 !== null).map(e => ({ ...e, t: e.r1 + e.r2 }));
  const miss = entries.filter(e => e.r2 === null);
  made.sort((a, b) => a.t - b.t || Math.random() - 0.5);
  poFront(made, x => x.t, po);
  const rows = []; let i = 0, playoff = false;
  while (i < made.length) {
    let j = i; while (j + 1 < made.length && made[j + 1].t === made[i].t) j++;
    let posFrom = i + 1, posTo = j + 1;
    if (i === 0 && j > 0) { // égalité pour la 1re place : prolongation
      playoff = true;
      rows.push([made[0].id, 1, made[0].r1, made[0].r2, pointsAt(1)]);
      const pts = Math.round(avg(range(2, posTo).map(pointsAt)));
      for (let k = 1; k <= j; k++) rows.push([made[k].id, 2, made[k].r1, made[k].r2, pts]);
    } else {
      const pts = Math.round(avg(range(posFrom, posTo).map(pointsAt)));
      for (let k = i; k <= j; k++) rows.push([made[k].id, posFrom, made[k].r1, made[k].r2, pts]);
    }
    i = j + 1;
  }
  miss.sort((a, b) => a.r1 - b.r1);
  miss.forEach(e => rows.push([e.id, 0, e.r1, null, MC_POINTS]));
  return po && po.res ? { rows, playoff, po: po.res } : { rows, playoff };
}
/* Tournoi d'une seule ronde (partie Duo) : tout le monde est class\u00e9 selon sa ronde ; les golfeurs dans la ligne de
   paye (les 'cut' premiers et les \u00e9galit\u00e9s) re\u00e7oivent points et bourse, les autres gardent leur rang sans points. */
function finalize1(entries, cut, po) {
  const all = entries.slice().sort((a, b) => a.r1 - b.r1 || Math.random() - 0.5);
  poFront(all, x => x.r1, po);
  const rows = []; let i = 0, playoff = false;
  while (i < all.length) {
    let j = i; while (j + 1 < all.length && all[j + 1].r1 === all[i].r1) j++;
    const posTo = j + 1, paid = all[i].r1 <= cut;
    if (i === 0 && j > 0) {
      playoff = true;
      rows.push([all[0].id, 1, all[0].r1, null, paid ? pointsAt(1) : MC_POINTS]);
      const pts = paid ? Math.round(avg(range(2, posTo).map(pointsAt))) : MC_POINTS;
      for (let k = 1; k <= j; k++) rows.push([all[k].id, 2, all[k].r1, null, pts]);
    } else {
      const pts = paid ? Math.round(avg(range(i + 1, posTo).map(pointsAt))) : MC_POINTS;
      for (let k = i; k <= j; k++) rows.push([all[k].id, i + 1, all[k].r1, null, pts]);
    }
    i = j + 1;
  }
  return po && po.res ? { rows, playoff, po: po.res } : { rows, playoff };
}
/* v294 : prolongation trou par trou (pression et sang-froid compris) jusqu'à ce qu'il reste un seul golfeur.
   v309 : elle repart du trou 1 et suit la carte (1, 2, 3… puis 1 à nouveau après le 18) : po.h[n] = trou n % 18.
   po = { w } (vainqueur déjà connu : prolongation jouée en direct) ou { pars, index, ctx } (prolongation simulée) ; sans po : au hasard (anciennes parties). */
function poHole(ids, pars, index, ctx, r, j) {
  const grid = gridFor(pars), D = {}, base = {};
  ids.forEach(id => { D[id] = solveDelta(grid, roundTarget(S.G[id], ctx, r == null ? 1 : r, 0)); base[id] = 0; });
  const H = liveFill(MODEL, pars, index, ctx.hv && ctx.hv[r == null ? 1 : r], ids, S.G, D, base, true, {}, 18, null), o = {};
  const hj = j == null ? 17 : ((j % 18) + 18) % 18;
  ids.forEach(id => { o[id] = H[id][hj]; });
  return o;
}
function poSim(ids, pars, index, ctx, out) {
  const all = ids.filter(id => S.G[id]); let left = all.slice(); if (left.length < 2) return left[0] != null ? left[0] : ids[0];
  const hs = [];
  for (let n = 0; n < 20 && left.length > 1; n++) { const sc = poHole(left, pars, index, ctx, 1, n), m = Math.min.apply(null, left.map(id => sc[id])); hs.push(sc); left = left.filter(id => sc[id] === m); }
  const w = left[Math.floor(Math.random() * left.length)];
  if (out) { out.ids = all; out.h = hs; out.w = w; }
  return w;
}
function poFront(arr, tot, po) {
  if (!po || arr.length < 2 || tot(arr[0]) !== tot(arr[1])) return;
  let j = 0; while (j + 1 < arr.length && tot(arr[j + 1]) === tot(arr[0])) j++;
  let w = po.w;
  if (w == null && po.pars) { try { const out = {}; w = poSim(arr.slice(0, j + 1).map(x => x.id), po.pars, po.index, po.ctx, out); if (out.h && out.h.length) po.res = { ids: out.ids, h: out.h }; } catch (e) { w = null; } }
  const k = arr.findIndex((x, i) => i <= j && x.id === w); if (k > 0) arr.unshift(arr.splice(k, 1)[0]);
}
/* v377 : tournoi d'une ronde — hors de la ligne de paye = coupure ratée (stats, séries, records), sans changer le rang affiché */
const rowOut = (r, L) => !!(L && L.one && r[1] > 0 && r[3] == null && L.cut != null && r[2] > L.cut);
const rowMC = (r, L) => r[1] === 0 || rowOut(r, L);
const paidRows = (rows, cut) => rows.filter(r => r[1] > 0 && (r[3] !== null || cut == null || r[2] <= cut));
function range(a, b) { const r = []; for (let k = a; k <= b; k++) r.push(k); return r; }
function avg(a) { return a.reduce((x, y) => x + y, 0) / a.length; }

/* ---- Simulation d'un tournoi entier pour un groupe d'IA (autres ligues) ---- */
function encHoles(a) { return a.map(x => x.toString(36)).join(''); }
function decHoles(str, off) { const o = []; for (let i = 0; i < 18; i++) { const ch = str.charAt(off + i); if (!ch) return null; o.push(parseInt(ch, 36)); } return o; }
function simTournamentAI(model, grid, pars, ids, G, ctx, cutSize, index, one) {
  const r1 = {}, hs = {}, on = liveOn(), D1 = {};
  ids.forEach(id => { D1[id] = solveDelta(grid, roundTarget(G[id], ctx, 0)); });
  const H1 = liveRound(model, pars, index, ctx.hv && ctx.hv[0], ids, G, D1, null, !!one);   // v216 : trou par trou (élan ; pression si ronde unique)
  ids.forEach(id => { r1[id] = relTo(H1[id], pars, 18); hs[id] = encHoles(H1[id]); });
  const cut = cutScoreOf(ids.map(id => r1[id]), cutSize);
  const PO = { pars, index, ctx };
  if (one) { const f = finalize1(ids.map(id => ({ id, r1: r1[id], r2: null })), cut, PO); const o = { rows: f.rows, cut, playoff: f.playoff, h: hs, one: 1 }; if (f.po) o.po = f.po; return o; }
  const lead1 = Math.min.apply(null, ids.map(id => r1[id]));
  const alive = ids.filter(id => r1[id] <= cut), D2 = {};
  alive.forEach(id => { D2[id] = solveDelta(grid, roundTarget(G[id], ctx, 1, on ? null : r1[id] - lead1)); });   // pression en direct : plus d'ajustement fixe au départ
  const H2 = liveRound(model, pars, index, ctx.hv && ctx.hv[1], alive, G, D2, r1, true);
  const entries = ids.map(id => {
    if (r1[id] > cut) return { id, r1: r1[id], r2: null };
    hs[id] += encHoles(H2[id]);
    return { id, r1: r1[id], r2: relTo(H2[id], pars, 18) };
  });
  const f = finalize(entries, PO);
  const o = { rows: f.rows, cut, playoff: f.playoff, h: hs }; if (f.po) o.po = f.po; return o;
}
/* Aléa d'un tournoi : le terrain (les deux rondes) et la météo (chaque ronde). Réglé par « Variabilité des terrains » : 1 = environ ±0,3 et ±0,55 coup. */
function newCtx() { const V = CFG.terrainVar == null ? 1 : CFG.terrainVar; return { course: gauss() * 0.32 * V, weather: [gauss() * 0.56 * V, gauss() * 0.56 * V], hv: newHoleVar() }; }
const DEFAULT_PARS = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5, 4, 4, 3, 4, 5];

/* ---- Détails de terrain : purement descriptifs, sauf le vent (voir windBump) ---- */
const TEE_OPTIONS = ['Black', 'Blue', 'Yellow', 'Green', 'White', 'Red', 'Junior', 'Par3'];   // du plus long au plus court
const TEE_COLORS = { Black: ['#1F1F1F', '#FFFFFF'], Blue: ['#1F5FBF', '#FFFFFF'], Yellow: ['#F2C80F', '#1A1A1A'], Green: ['#2E8B3A', '#FFFFFF'], White: ['#FFFFFF', '#1A1A1A'], Red: ['#C62828', '#FFFFFF'], Junior: ['#F08A24', '#1A1A1A'], Par3: ['#8E8E8E', '#FFFFFF'] };
const TEE_SYN = { noir: 'Black', bleu: 'Blue', jaune: 'Yellow', vert: 'Green', blanc: 'White', rouge: 'Red' };
/* Tee \u00e9crit \u00e0 la main (CSV, anciennes parties) ramen\u00e9 \u00e0 la liste : casse, accents et pluriel ignor\u00e9s (\u00ab bleus \u00bb = Bleu). null si inconnu. */
function canonTee(v) { const n = (v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, '').replace(/s$/, ''); return TEE_OPTIONS.find(t => t.toLowerCase() === n) || TEE_SYN[n] || null; }
function teeRank(t) { const k = TEE_OPTIONS.indexOf(t); return k < 0 ? 99 : k; }
function teeBadge(t) { const c = TEE_COLORS[t] || ['var(--bg)', 'var(--ink)']; return '<span class="teeb' + (t === 'White' ? ' w' : '') + '" style="background:' + c[0] + ';color:' + c[1] + '">' + esc(t) + '</span>'; }
const WIND_LEVELS = ['none', 'calm', 'breezy', 'gusty'];
const WIND_LABELS = { none: 'No Wind', calm: 'Calm', breezy: 'Breezy', gusty: 'Gusty' };   // noms de GSPro
const PIN_DAYS = ['thu', 'fri', 'sat', 'sun'];
const PIN_LABELS = { thu: 'Jeudi', fri: 'Vendredi', sat: 'Samedi', sun: 'Dimanche' };
function defaultIndex() { return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18]; }
function newCourseMeta() { return { tee: 'White', dist: 6070, cr: 70.3, slope: 126, index: defaultIndex(), pin: 'thu', wind: 'none', pin2: 'fri', wind2: 'none' }; }
function newBankCourse(name) { return { name: name || 'Nouveau terrain', tee: 'White', pars: DEFAULT_PARS.slice(), index: defaultIndex(), dist: 6070, cr: 70.3, slope: 126 }; }
/* ---- Noms de terrains fictifs et statistiques aléatoires (pour le bouton « Générer ») ----
   Distribution en cloche (gauss) centrée sur la moyenne fournie, avec l'écart-type calculé pour que la
   borne donnée corresponde à 2,5 écarts-types : les valeurs près de la moyenne sont fréquentes, les extrêmes
   près des bornes sont rares (moins de 1 % de chances d'atteindre exactement une borne). */
function gaussRange(mean, lo, hi, sdDiv) {
  sdDiv = sdDiv || 2.5;
  const z = gauss();
  const sd = z < 0 ? (mean - lo) / sdDiv : (hi - mean) / sdDiv;
  return clamp(mean + z * sd, lo, hi);
}
const COURSE_NAMES = [
  'Le Vallon Doré', 'Les Cascades Royales', 'Le Domaine des Pins', 'La Rivière Bleue', 'Le Mont Sauvage',
  'La Clairière Secrète', 'Le Boisé Ancien', 'L’Anse Paisible', 'La Falaise d’Argent', 'Le Coteau Enchanté',
  'La Source Cachée', 'La Prairie Dorée', 'Le Lac Tranquille', 'Le Manoir des Chênes', 'Le Ruisseau Perdu',
  'La Baie Royale', 'Les Étangs Bleus', 'Les Vergers d’Automne', 'Les Rochers Blancs', 'La Forêt Majestueuse',
  'Le Cap Doré', 'Les Collines Sauvages', 'Le Domaine Royal', 'Les Pins Argentés', 'Les Chênes Centenaires',
  'Le Vieux Moulin', 'La Pointe aux Pins', 'Les Sentiers du Nord', 'Le Repaire du Cerf', 'La Combe Fleurie'
];
function shuffled(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
/* Une s\u00e9quence de 18 par (3/4/5) plausible dont le total tombe entre 70 et 72, comme un vrai parcours :
   nombre de par 3 et de par 5 tir\u00e9s dans une fourchette usuelle (2 \u00e0 5), le reste en par 4, puis m\u00e9lang\u00e9s
   (en r\u00e9essayant si 3 trous identiques se suivent, pour \u00e9viter un groupement trop artificiel). */
function randomPars() {
  const pick = () => 2 + Math.floor(Math.random() * 4); // 2 à 5
  let n3, n5;
  for (let tries = 0; tries < 30; tries++) {
    n3 = pick(); n5 = pick();
    const total = 72 - n3 + n5;
    if (total >= 70 && total <= 72 && 18 - n3 - n5 >= 6) break;
  }
  const n4 = 18 - n3 - n5;
  const base = Array(n3).fill(3).concat(Array(n4).fill(4), Array(n5).fill(5));
  let arr = shuffled(base), guard = 0;
  while (guard++ < 40 && arr.some((v, i) => i >= 2 && v === arr[i - 1] && v === arr[i - 2])) arr = shuffled(base);
  return arr;
}
function shuffleIndex() { return shuffled(defaultIndex()); }

/* Vent : seul r\u00e9glage de terrain \u00e0 avoir un effet de jeu, ajout\u00e9 aux coups attendus de la ronde.
   \u00ab Aucun vent \u00bb et \u00ab Calme \u00bb n'ont aucun effet ; \u00ab Vent l\u00e9ger \u00bb ajoute en moyenne 1 \u00e0 2 coups,
   \u00ab Vent fort \u00bb en ajoute 3 \u00e0 4, avec une variation al\u00e9atoire autour de cette moyenne. */
function windBump(level) { return windBump0(level) * (CFG && CFG.windMul != null ? CFG.windMul : 1); }
function windBump0(level) {
  if (level === 'breezy') return clamp(1.5 + gauss() * 0.45, 0.4, 3);
  if (level === 'gusty') return clamp(3.5 + gauss() * 0.55, 2, 5.5);
  return 0;
}
/* Tirage al\u00e9atoire du vent, pond\u00e9r\u00e9 pour rester proche du calibrage d'origine : comme le vent ne
   fait jamais baisser la difficult\u00e9 (contrairement au course rating, qui peut aller dans les deux sens),
   un tirage uniforme sur les 4 niveaux d\u00e9calerait syst\u00e9matiquement les scores vers le haut. \u00ab Aucun
   vent \u00bb et \u00ab Calme \u00bb (sans effet) restent donc largement les plus fr\u00e9quents. */
const WIND_WEIGHTS = [10, 39, 32, 19];   // none, calm, breezy, gusty (en %) ; réglable : CFG.windW
function windW() { const w = Array.isArray(CFG.windW) && CFG.windW.length === 4 ? CFG.windW.map(x => Math.max(0, +x || 0)) : WIND_WEIGHTS, t = w.reduce((a, b) => a + b, 0); return t > 0 ? w.map(x => x / t) : WIND_WEIGHTS.map(x => x / 100); }
function randomPin() { return PIN_DAYS[Math.floor(Math.random() * PIN_DAYS.length)]; }   // jeudi à dimanche, 25 % chacun
function randomWind() {
  const r = Math.random(), W = windW(); let acc = 0;
  for (let i = 0; i < WIND_LEVELS.length; i++) { acc += W[i]; if (r < acc) return WIND_LEVELS[i]; }
  return WIND_LEVELS[WIND_LEVELS.length - 1];
}
/* ---- Bourses de tournoi ----
   Ligue 1 : bourse al\u00e9atoire entre 10 M$ et 15 M$, arrondie au 100 000$ ; les autres ligues touchent
   une fraction fixe de cette m\u00eame bourse (10 % / 2,5 % / 0,8 %). R\u00e9partition par position bas\u00e9e sur les
   pourcentages officiels du PGA Tour (positions 1 \u00e0 65, qui correspondent \u00e0 la coupure par d\u00e9faut).
   Au-del\u00e0 de la 65e place (coupures plus larges), tout le monde qui fait la coupure touche au moins
   le pourcentage de la 65e place, comme la vraie Tourn\u00e9e ajoute de l'argent pour ces cas. */
const LEAGUE_PURSE_PCT = [1, 0.10, 0.025, 0.008];
const PAYOUT_PCT = [
  0.18000, 0.10900, 0.06900, 0.04900, 0.04100, 0.03625, 0.03375, 0.03125, 0.02925, 0.02725,
  0.02525, 0.02325, 0.02125, 0.01925, 0.01825, 0.01725, 0.01625, 0.01525, 0.01425, 0.01325,
  0.01225, 0.01125, 0.01045, 0.00965, 0.00885, 0.00805, 0.00775, 0.00745, 0.00715, 0.00685,
  0.00655, 0.00625, 0.00595, 0.00570, 0.00545, 0.00520, 0.00495, 0.00475, 0.00455, 0.00435,
  0.00415, 0.00395, 0.00375, 0.00355, 0.00335, 0.00315, 0.00295, 0.00279, 0.00265, 0.00257,
  0.00251, 0.00245, 0.00241, 0.00237, 0.00235, 0.00233, 0.00231, 0.00229, 0.00227, 0.00225,
  0.00223, 0.00221, 0.00219, 0.00217, 0.00215
];
/* v317 : chaque terrain de la saison a sa bourse (L1, de base) : choisie, tirée au 🎲, ou tirée avec le terrain */
function cPurse(c) { if (!c) return randomPurse(); if (c.purse == null || !(c.purse > 0)) c.purse = randomPurse(); return c.purse; }
function randomPurse() { return Math.round((PURSE_RANGE[0] + Math.random() * (PURSE_RANGE[1] - PURSE_RANGE[0])) / 100000) * 100000; }
function payoutAt(pos) { if (pos < 1) return 0; return PAYOUT_PCT[Math.min(pos, PAYOUT_PCT.length) - 1]; }
/* rows : [[id,pos,r1,r2,pts], ...] d\u00e9j\u00e0 group\u00e9s par finalize() (les \u00e9galit\u00e9s partagent la m\u00eame position). */
function computePayouts(rows, purse) {
  const groups = {};
  rows.forEach(r => { if (r[1] > 0) (groups[r[1]] = groups[r[1]] || []).push(r[0]); });
  const pay = {};
  Object.keys(groups).forEach(k => {
    const pos = +k, ids = groups[k], n = ids.length;
    const amt = avg(range(pos, pos + n - 1).map(payoutAt)) * purse;
    ids.forEach(id => { pay[id] = Math.round(amt / 100) * 100; });
  });
  return pay;
}
/* L'index de handicap (1 = trou le plus difficile, 18 = le plus facile) donne un léger avantage ou
   désavantage à chaque trou. Les décalages sont symétriques autour de l'index médian (9,5), donc leur
   somme sur les 18 trous est nulle : la difficulté moyenne de la ronde ne change pas, seule sa
   répartition trou par trou devient plus réaliste. */
function indexShift(idx) { return (9.5 - (idx || 9.5)) * CFG.idxK; }



/* ---- Classement de saison + fin de saison (promotion / relégation) ---- */
function newStanding() { return { pts: 0, w: 0, t10: 0, t5: 0, t3: 0, n: 0, mc: 0, mcs: 0, sum: 0, rds: 0 }; }
const tieHash = id => ((id + 7) * 2654435761) % 4294967296;
/* Un golfeur arrivé en cours de saison (promu ou relégué) est classé dans sa nouvelle ligue avec les seuls points
   gagnés depuis son arrivée ; il reste protégé contre la relégation de fin de saison (voir endSeason). */
/* Porteur de l'état « déplacé en cours de saison » (g.mv) : le golfeur lui-même, ou, en mode « je joue moi-même »
   (pas de golfeur simulé), les statistiques du joueur (S.pk). */
function gmv(id) { if (!S) return null; const g = S.G[id]; if (g) return g; return id === 0 && S.mode !== 'sim' && S.pk && leagueOf(0) >= 0 ? S.pk : null; }
function lgBase(id) {
  const g = gmv(id), m = g && g.mv; if (!m) return null;
  const sn = m.snap || {}, mv = m.moves || [];
  return { pts: sn.pts != null ? sn.pts : (mv.length ? mv[mv.length - 1].pts : (m.fromPts || 0)), w: sn.w || 0, t10: sn.t10 || 0 };
}
function lgSt(id) { const s = getSt(id), b = lgBase(id); return b ? { pts: s.pts - b.pts, w: s.w - b.w, t10: s.t10 - b.t10 } : { pts: s.pts, w: s.w, t10: s.t10 }; }
function cmpStanding(st) {
  const P = id => st[id].pts - ((lgBase(id) || {}).pts || 0), Wn = id => st[id].w - ((lgBase(id) || {}).w || 0);
  return (a, b) => (P(b) - P(a)) || (Wn(b) - Wn(a)) || ((st[a].rds ? st[a].sum / st[a].rds : 99) - (st[b].rds ? st[b].sum / st[b].rds : 99)) || (tieHash(a) - tieHash(b));
}
function rankIds(ids, st) { return ids.slice().sort(cmpStanding(st)); }
function meanOverall(ids, G) { const a = ids.filter(i => G[i]).map(i => G[i].o); return a.length ? a.reduce((x, y) => x + y, 0) / a.length : 400; }

/* ---- Recrues : toutes arrivent en Ligue 4, entre 17 et 25 ans. Le niveau de départ suit une courbe centrée
   autour de 300 (le cas le plus commun), avec de bonnes chances de tomber plus bas ou plus haut, et de
   rares recrues exceptionnelles jusqu'à 600. Le potentiel (le sommet visé) est tiré séparément au hasard :
   les plus jeunes ont la plus grande marge de progression, les plus vieux presque aucune. ---- */
const ROOK = { ageMin: 17, ageMax: 25, cap: 900, ptC: 450, ptS: 1.15, f0: 0.35, f1: 0.35, scout: 80, scPiv: 700, scS: 0.75, eraAmp: 0, eraKeep: 0.9, eraSd: 0.35, mu0: 300, dmu: 8, sd0: 95, roomScale: 330, roomPow: 1.35, roomFloor: 30, roomSd: 0.55 };
function rookieOverall(age) {
  const mu = ROOK.mu0 + (age - ROOK.ageMin) * ROOK.dmu;
  for (let i = 0; i < 30; i++) { const o = mu + gauss() * ROOK.sd0; if (o >= 40 && o <= ROOK.cap) return o; }
  return clamp(mu, 40, ROOK.cap);
}
/* v168 : le plafond réel (pt) de chaque recrue est tiré sur la courbe de référence (OVERALL_DIST), étirée autour de 450
   (ROOK.ptC, ROOK.ptS) ; la recrue commence à une fraction de ce plafond (plus jeune = plus loin). Ainsi la distribution
   du circuit reste proche du tableau saison après saison, au lieu de se tasser au milieu (Average/Semi-Pro). */
