export default function computeDagwaarde(
  waardeDagdelen, som_gem = 'gem', maxFactor = 100, dagdeelFilter = [1,1,1,1,1] ) {
  // maxFActor is getal tussen 0 en 200, hiermee wordt de hoogste waarde verhoogd, afhankelijk vn aantal metingem
  let dagwaarde = 0
  let hoogsten = [];

  let waardeDagdelenAlsGetal = waardeDagdelen
    .split("") // Splits de string in een array van karakters
    .map(Number) // Converteer elk karakter naar een getal
  let som = 0 
  for (let i=0; i<=4; i++) {
    waardeDagdelenAlsGetal[i] = waardeDagdelenAlsGetal[i] * dagdeelFilter[i] // gebruik dagdeelFilter;
    som += waardeDagdelenAlsGetal[i]
  }

  if (som == 0) {
    dagwaarde = 0;
  } else {
    const nietNul = waardeDagdelenAlsGetal
      .filter((n) => n > 0); // Filter alleen de getallen groter dan 0
      
    const hoogste = (() => {
      const max = Math.max(...nietNul);
      hoogsten = nietNul.filter(n => n === max);
      return hoogsten[0];
    })();

    const somNietHoogsten = nietNul.reduce((a, b) => a + b, 0) - hoogste; // Som van alle waarden behalve de hoogste
    
    let gemNietHoogsten = 1 * (somNietHoogsten / (nietNul.length - 1)).toFixed(2);
    if (isNaN(gemNietHoogsten)) {
      gemNietHoogsten = hoogste;
    }

    const verschil = hoogste-gemNietHoogsten

    if  (som_gem=='max') {
        dagwaarde = hoogsten[0];
    } else 
    
    if (som_gem=='som') { 
      let score = 0;
      let clusteringPenalty = 0;
      
      if (nietNul.length == 1) { // 1 waarde ingevuld, dus dat is ook de som
          dagwaarde = hoogste; // 
      } else {

        // Loop over de waardeDagdelen
        for (let i = 0; i < waardeDagdelenAlsGetal.length; i++) {
          let b = waardeDagdelenAlsGetal[i];
          
          // Lichte inspanning (<= 2) krijgt minder gewicht
          if (b <= 2) {
            if (maxFactor > 100) // kies hoog
              score += b * 0.5; // Demping voor lichte inspanningen
            else
              score += b * 0.2; // Demping voor lichte inspanningen

          }
          // Zwaardere inspanning (>= 3) krijgt meer gewicht
          else {
            if (maxFactor > 100) // kies hoog 
              score += Math.pow(b, 0.85); // Exponentiële toename bij grotere inspanning
            else 
              score += Math.pow(b, 0.7); // Exponentiële toename bij grotere inspanning
          }
          
          // Straf voor aaneengeschakelde inspanning
          if (i > 0 && waardeDagdelenAlsGetal[i] > 0 && waardeDagdelenAlsGetal[i-1] > 0) {
            clusteringPenalty += 0.5;
          }
        }
        
        // Combineer score en penaliteit
        dagwaarde = Math.min(5, Math.round((score + clusteringPenalty) * 0.8)); // Schaal naar een max van 5
        // Zorg dat de uiteindelijke score niet boven 5 komt    
      }
    } else

    if (som_gem=='gem') { 
      // 1) gebruik alleen de getallen groter dan 0
      // const nietNul = waardeDagdelen.filter(n => n > 0);
      
      if (verschil <= 0.3) { // dus bij 1, 2 of 3 of 4 dezelfde hoogste getallen 
        dagwaarde = hoogste 
          
      } else if (hoogsten.length>2) { // 4441 of 33311 wordt altijd hoogste
        dagwaarde = hoogste

      } else if (hoogsten.length===2) { // vanwege vorige if zit er altijd een extra getal bij
        if (nietNul.length == 3) {// bijv 441 of 443 
          if (maxFactor<100)  {
            if (verschil>1.4) dagwaarde = hoogste - 1 
            else dagwaarde = hoogste
          } else dagwaarde = hoogste // bijv 441 of 443
        } else {
       
          if (maxFactor<100) 
            dagwaarde = Math.round((hoogste * 1.2 + gemNietHoogsten) / 3);  
          else if (maxFactor==100) 
            dagwaarde = Math.round((hoogste * 1.8 + gemNietHoogsten) / 3);  
          else if (maxFactor>100)  
            dagwaarde = Math.round((hoogste * 2.4 + gemNietHoogsten) / 3); 
        }
         
      } else { // 1 hoogste getal 
      
        if (nietNul.length === 2) {  // er zijn 2 getallen 
          if (verschil <=1.3) {  
            if (maxFactor<100)  dagwaarde = hoogste - 1
            else {
              console.log('110: dagwaarde:', dagwaarde, 'nietNul.length:', nietNul.length, 'hoogste:', hoogste, 'gemNietHoogsten:', gemNietHoogsten, 'verschil:', verschil, 'maxFactor:', maxFactor)
              if (maxFactor==100) dagwaarde = hoogste - 1
              else {
                dagwaarde = hoogste
                console.log('114: dagwaarde gezet: ', dagwaarde)
              }
            }
          }

          else if (verschil <=2) { 
            if (maxFactor<100) dagwaarde = hoogste - 1
            else if (maxFactor==100) dagwaarde = hoogste 
            else  dagwaarde = hoogste
          }
          else  { 
           
            if (maxFactor<100)  dagwaarde = hoogste - 2
            else if (maxFactor==100) dagwaarde = hoogste - 1
            else  dagwaarde = hoogste - 1
            console.log('124: dagwaarde ', dagwaarde)
          }

        } else if (nietNul.length === 3) {  // er zijn 3 getallen waarvan 1 de hoogste    
          if (verschil <= 1.3) {  
            if (maxFactor<100)  dagwaarde = hoogste - 1
            else if (maxFactor==100) dagwaarde = hoogste
            else if (maxFactor>100)  dagwaarde = hoogste
          }
          if (verschil <= 2) {  
            if (maxFactor<100)  dagwaarde = hoogste - 1
            else if (maxFactor==100) dagwaarde = hoogste
            else if (maxFactor>100)  dagwaarde = hoogste
          } else {
            if (maxFactor<100)  dagwaarde = hoogste - 2
            else {
              if (maxFactor==100) dagwaarde = hoogste -1 
              else  dagwaarde = hoogste
            }
          }

        } else if (nietNul.length > 3) { // optie 4: er zijn 4 of 5 getallen waarvan 1 de h  
          if (maxFactor<100) 
            dagwaarde = Math.round((hoogste * 1.2 + gemNietHoogsten) / 3);  
          else if (maxFactor==100) 
            dagwaarde = Math.round((hoogste * 1.8 + gemNietHoogsten) / 3);  
          else if (maxFactor>100)  
            dagwaarde = Math.round((hoogste * 2.4  + gemNietHoogsten) / 3);  
        }
      }
    }        
  }
  //if (dagwaarde > 5) dagwaarde = 5
  
  
  console.log(
    '08 input: waardeDagdelen:', waardeDagdelen, 
    'som_gem:', som_gem, 
    'maxFactor:', maxFactor, 
    'dagdeelFilter:', dagdeelFilter, 
    'berekend: ', dagwaarde 
  ) 

  let dagwaardeGegevens = 
    { "waardeDagdelen": waardeDagdelen,
      "waardeDagdelenMetFilter" : waardeDagdelenAlsGetal.join(""),
      "maxFactor": maxFactor, 
      "dagwaarde": dagwaarde
    }

  return dagwaardeGegevens.dagwaarde
}