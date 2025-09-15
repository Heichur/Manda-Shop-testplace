
const pokemonList = [
  
 'Spiritomb', 'Pichu', 'Cleffa', 'Igglybuff', 'Togepi', 'Tyrogue', 'Smoochum', 'Elekid', 
  'Magby', 'Azurill', 'Wynaut', 'Budew', 'Chingling', 'Bonsly', 'Mime Jr.', 
  'Happiny', 'Munchlax', 'Riolu', 'Mantyke',
  
  'Bulbasaur', 'Charmander', 'Squirtle', 'Caterpie', 'Weedle', 'Pidgey', 
  'Rattata', 'Rattata de Alola', 'Spearow', 'Ekans', 'Pikachu', 
  'Sandshrew', 'Sandshrew de Alola', 'Nidoran♀', 'Nidoran♂', 'Clefairy', 
  'Vulpix', 'Vulpix de Alola', 'Jigglypuff', 'Zubat', 'Oddish', 'Paras', 
  'Venonat', 'Diglett', 'Diglett de Alola', 'Meowth', 'Meowth de Alola', 
  'Meowth de Galar', 'Psyduck', 'Mankey', 'Growlithe', 'Growlithe de Hisui', 
  'Poliwag', 'Abra', 'Machop', 'Bellsprout', 'Tentacool', 'Geodude', 
  'Geodude de Alola', 'Ponyta', 'Ponyta de Galar', 'Slowpoke', 
  'Slowpoke de Galar', "Farfetch'd", "Farfetch'd de Galar", 'Doduo', 'Seel', 
  'Grimer', 'Grimer de Alola', 'Shellder', 'Gastly', 'Onix', 'Drowzee', 
  'Krabby', 'Cubone', 'Hitmonlee', 'Hitmonchan', 'Lickitung', 'Koffing', 
  'Rhyhorn', 'Chansey', 'Tangela', 'Kangaskhan', 'Horsea', 'Goldeen', 
  'Scyther', 'Jynx', 'Electabuzz', 'Magmar', 'Pinsir', 'Tauros', 
  'Tauros de Paldea Combate', 'Tauros de Paldea Chama', 'Tauros de Paldea Aqua', 
  'Magikarp', 'Lapras', 'Eevee', 'Snorlax', 'Dratini',
  
  
  'Chikorita', 'Cyndaquil', 'Cyndaquil de Hisui', 'Totodile', 'Sentret', 
  'Hoothoot', 'Ledyba', 'Spinarak', 'Natu', 'Mareep', 'Marill', 'Sudowoodo', 
  'Hoppip', 'Aipom', 'Sunkern', 'Yanma', 'Wooper', 'Wooper de Paldea', 
  'Murkrow', 'Misdreavus', 'Girafarig', 'Pineco', 'Dunsparce', 'Gligar', 
  'Snubbull', 'Qwilfish', 'Qwilfish de Hisui', 'Shuckle', 'Heracross', 
  'Sneasel', 'Sneasel de Hisui', 'Teddiursa', 'Slugma', 'Swinub', 'Corsola', 
  'Corsola de Galar', 'Remoraid', 'Delibird', 'Skarmory', 'Houndour', 
  'Phanpy', 'Stantler', 'Smeargle', 'Miltank', 'Larvitar',
  
  
  'Treecko', 'Torchic', 'Mudkip', 'Poochyena', 'Zigzagoon', 'Zigzagoon de Galar', 
  'Wurmple', 'Lotad', 'Seedot', 'Taillow', 'Wingull', 'Ralts', 'Surskit', 
  'Shroomish', 'Slakoth', 'Nincada', 'Whismur', 'Makuhita', 'Skitty', 
  'Sableye', 'Mawile', 'Aron', 'Meditite', 'Electrike', 'Plusle', 'Minun', 
  'Volbeat', 'Illumise', 'Roselia', 'Gulpin', 'Carvanha', 'Wailmer', 'Numel', 
  'Torkoal', 'Spoink', 'Spinda', 'Trapinch', 'Cacnea', 'Swablu', 'Zangoose', 
  'Seviper', 'Barboach', 'Corphish', 'Feebas', 'Kecleon', 'Shuppet', 'Duskull', 
  'Tropius', 'Absol', 'Snorunt', 'Spheal', 'Clamperl', 'Relicanth', 'Luvdisc', 
  'Bagon', 'Mimikyu', 
  
  
  'Turtwig', 'Chimchar', 'Piplup', 'Starly', 'Bidoof', 'Kricketot', 'Shinx', 
  'Cranidos', 'Shieldon', 'Burmy', 'Combee', 'Pachirisu', 'Buizel', 'Shellos', 
  'Voltorb de Hisui', 'Drifloon', 'Buneary', 'Glameow', 'Stunky', 
  'Stunfisk de Galar', 'Chatot', 'Gible', 'Hippopotas', 'Skorupi', 'Croagunk', 
  'Carnivine', 'Finneon', 'Snover',
'Mareanie','Togedemaru', 'Toxapex', 
  
  'Snivy', 'Tepig', 'Oshawott', 'Oshawott de Hisui', 'Patrat', 'Lillipup', 
  'Purrloin', 'Pansage', 'Pansear', 'Panpour', 'Munna', 'Pidove', 'Blitzle', 
  'Roggenrola', 'Woobat', 'Drilbur', 'Audino', 'Timburr', 'Tympole', 'Throh', 
  'Sawk', 'Sewaddle', 'Venipede', 'Cottonee', 'Petilil', 'Petilil de Hisui', 
  'Basculin', 'Basculin de Hisui', 'Sandile', 'Darumaka', 'Darumaka de Galar', 
  'Maractus', 'Dwebble', 'Scraggy', 'Sigilyph', 'Yamask', 'Yamask de Galar', 
  'Tirtouga', 'Archen', 'Trubbish', 'Zorua', 'Zorua de Hisui', 'Minccino', 
  'Gothita', 'Solosis', 'Ducklett', 'Vanillite', 'Deerling', 'Emolga', 
  'Karrablast', 'Foongus', 'Frillish', 'Alomomola', 'Joltik', 'Ferroseed', 
  'Tynamo', 'Elgyem', 'Litwick', 'Axew', 'Cubchoo', 'Shelmet', 'Stunfisk', 
  'Mienfoo', 'Druddigon', 'Golett', 'Pawniard', 'Bouffalant', 'Rufflet', 
  'Rufflet de Hisui', 'Vullaby', 'Heatmor', 'Durant', 'Deino', 'Larvesta',
  

  'Chespin', 'Fennekin', 'Froakie', 'Bunnelby', 'Fletchling', 'Scatterbug', 
  'Litleo', 'Flabébé', 'Skiddo', 'Pancham', 'Furfrou', 'Espurr', 'Honedge', 
  'Spritzee', 'Swirlix', 'Inkay', 'Binacle', 'Skrelp', 'Clauncher', 'Helioptile', 
  'Tyrunt', 'Amaura', 'Hawlucha', 'Dedenne', 'Goomy', 'Goomy de Hisui', 
  'Klefki', 'Phantump', 'Pumpkaboo', 'Bergmite', 'Bergmite de Hisui', 'Noibat',
  

  'Rowlet', 'Rowlet de Hisui', 'Litten', 'Popplio', 'Pikipek', 'Yungoos', 
  'Grubbin', 'Crabrawler', 'Oricorio', 'Cutiefly', 'Rockruff', 'Wishiwashi', 
  'Mareanie', 'Mudbray', 'Dewpider', 'Fomantis', 'Morelull', 'Salandit', 
  'Stufful', 'Bounsweet', 'Comfey', 'Oranguru', 'Passimian', 'Wimpod', 
  'Sandygast', 'Pyukumuku', 'Jangmo-o',

  'Grookey', 'Scorbunny', 'Sobble', 'Skwovet', 'Rookidee', 'Blipbug', 'Nickit', 
  'Gossifleur', 'Wooloo', 'Chewtle', 'Yamper', 'Rolycoly', 'Applin', 'Silicobra', 
  'Cramorant', 'Arrokuda', 'Toxel', 'Sizzlipede', 'Clobbopus', 'Sinistea', 
  'Hatenna', 'Impidimp', 'Milcery', 'Falinks', 'Pincurchin', 'Snom', 
  'Stonjourner', 'Eiscue', 'Indeedee', 'Morpeko', 'Cufant', 'Duraludon', 'Dreepy',
  

  'Sprigatito', 'Fuecoco', 'Quaxly', 'Lechonk', 'Tarountula', 'Nymble', 'Pawmi', 
  'Tandemaus', 'Fidough', 'Smoliv', 'Squawkabilly', 'Nacli', 'Charcadet', 
  'Tadbulb', 'Wattrel', 'Maschiff', 'Shroodle', 'Bramblin', 'Toedscool', 'Klawf', 
  'Capsakid', 'Rellor', 'Flittle', 'Tinkatink', 'Wiglett', 'Bombirdier', 'Finizen', 
  'Varoom', 'Cyclizar', 'Orthworm', 'Glimmet', 'Greavard', 'Flamigo', 'Cetoddle', 
  'Veluza', 'Dondozo', 'Tatsugiri', 'Frigibax',
  

  'Dipplin', 'Poltchageist',

  //Fósseis
  'Omanyte', 'Omastar',
'Kabuto' ,'Kabutops',
'Aerodactyl',
'Lileep', 'Cradily',
'Anorith', 'Armaldo',
'Cranidos', 'Rampardos',
'Shieldon', 'Bastiodon',
'Tirtouga', 'Carracosta',
'Archen', 'Archeops',
'Tyrunt', 'Tyrantrum', 
'Amaura', 'Aurorus'
].filter(pokemon => pokemon && typeof pokemon === 'string' && pokemon.trim() !== '');