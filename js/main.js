const viewElementInfo = document.getElementById("view-element-info");
const electronicToggle = document.getElementById("electronic-toggle");
const viewportLabelCategory = document.getElementById("category-label-viewport")
const specialElements = {
    "spaceToAC": document.getElementById("element-AC"),
    "spaceToLA": document.getElementById("element-LA")
}
const periodicColors = {
    "categoryTable":{
        "gases nobles": "#116AE0",
        "alcalinos": "#FF602B",
        "alcalinotérreos": "#E5815F",
        "metales de transición":"#F6BF39",
        "lantánidos":"#E82D3A",
        "actínidos":"#DC2CD9",
        "metales del bloque p":"#2FDA55",
        "no metales": "#977CCF",
        "semimetales": "#05D5FF"
    },
    "blockTable":{
        "s":"#FF8ECB",
        "p":"#B698FF",
        "d":"#90D6D5",
        "f":"#C0DF8A",
    }
}
const classifiedElements= {
    "block":{
        "s":[],
        "p":[],
        "d":[],
        "f":["LA", "AC"]
    },
    "category":{
        "gases nobles": [],
        "alcalinos": [],
        "alcalinotérreos": [],
        "metales de transición":[],
        "lantánidos":["LA"],
        "actínidos":["AC"],
        "metales del bloque p":[],
        "no metales": [],
        "semimetales": []
    }
}

// Pre load Image
let errorImagePreload = new Image();
errorImagePreload.src = "/electrorbit/svg/error.svg";
errorImagePreload.onload = () => console.log("Pre loaded sources");

let periodicTable;

async function getPeriodicTable() {
    let response = await fetch('/electrorbit/db/periodic_table.json');
    let data = await response.json();
    return data.elements
}

function formatStringtoFirstUpperLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

async function getStringFromArray(arr){
    return (arr !== null)? arr.join(", ") : "Desconocido"
}

async function getCelciusFromKelvin(k) {
    return (k !== null)? (k - 273.15) + " °C": "Desconocido"
}

async function setElement(elementWrapper, elementInfo, elementColor) {
    elementWrapper.innerHTML = `
        <div class="element-info">
            <span class="element-number">${elementInfo.number}</span>
            <p class="symbol">${elementInfo.symbol}</p>
        </div>
        <div id="element-${elementInfo.number}-color" 
            class="element-color" 
            style="background: ${elementColor};"></div>
    `
}

function tooglePeriodicTableStyle() {
    const isChecked = electronicToggle.checked
    const periodicStyle = isChecked ? "blockTable": "categoryTable"
    const periodicType = isChecked ? "block": "category"

    periodicTable.forEach((element) => {        
        const elementBar = document.getElementById("element-"+element.number+"-color");
        if(!elementBar) {return;}
        elementBar.style = `background: ${periodicColors[periodicStyle][element[periodicType]]};`;

        const viewportElement = document.getElementById("viewport-element-"+ element.number);
        if(!viewportElement) {return;}
        viewportElement.style = `background: ${periodicColors[periodicStyle][element[periodicType]]};`
    })

    const elementAC = document.getElementById("element-57-71-color");
    const elementLA = document.getElementById("element-89-103-color");

    const viewportAC = document.getElementById("viewport-element-AC");
    const viewportLA = document.getElementById("viewport-element-LA");

    if (isChecked) {
        elementAC.style = `background: ${periodicColors.blockTable.f}`
        elementLA.style = `background: ${periodicColors.blockTable.f}`

        viewportAC.style = `background: ${periodicColors.blockTable.f}`
        viewportLA.style = `background: ${periodicColors.blockTable.f}`
    } else {
        elementAC.style = `background: ${periodicColors.categoryTable.actínidos}`
        elementLA.style = `background: ${periodicColors.categoryTable.lantánidos}`

        viewportAC.style = `background: ${periodicColors.categoryTable.actínidos}`
        viewportLA.style = `background: ${periodicColors.categoryTable.lantánidos}`
    }
}

function toogleHightlighViewportElements(event, element) {
    function hightlightElements(categoryTable, event, categoryLabelText) {
        categoryTable.forEach((elementId) => {
            const viewportElement = document.getElementById("viewport-element-"+elementId)
            if (event === "mouseenter") {
                viewportElement.classList.add("hightlighted-viewport");
            }
            else {
                viewportElement.classList.remove("hightlighted-viewport");
            }
        })

        if(event == "mouseenter") {
            viewportLabelCategory.innerHTML = categoryLabelText;
            viewportLabelCategory.classList.add("hightlighted-label");
        } else {
            viewportLabelCategory.classList.remove("hightlighted-label")
        }
    }
    
    if(electronicToggle.checked) {
        hightlightElements(
            classifiedElements.block[element.block],
            event.type,
            `Block ${element.block}`
        )
    }
    else {
        hightlightElements(
            classifiedElements.category[element.category],
            event.type,
            `${formatStringtoFirstUpperLetter(element.category)}`
        )
    }
}

async function getElectronicConfiguration(atomNum) {
    const subniveles = [
        { nivel: 1, tipo: 's', capacidad: 2 },
        
        { nivel: 2, tipo: 's', capacidad: 2 },
        
        { nivel: 2, tipo: 'p', capacidad: 6 },
        { nivel: 3, tipo: 's', capacidad: 2 },
        
        { nivel: 3, tipo: 'p', capacidad: 6 },
        { nivel: 4, tipo: 's', capacidad: 2 },
        
        { nivel: 3, tipo: 'd', capacidad: 10 },
        { nivel: 4, tipo: 'p', capacidad: 6 },
        { nivel: 5, tipo: 's', capacidad: 2 },
        
        { nivel: 4, tipo: 'd', capacidad: 10 },
        { nivel: 5, tipo: 'p', capacidad: 6 },
        { nivel: 6, tipo: 's', capacidad: 2 },

        { nivel: 4, tipo: 'f', capacidad: 14 },
        { nivel: 5, tipo: 'd', capacidad: 10 },
        { nivel: 6, tipo: 'p', capacidad: 6 },
        { nivel: 7, tipo: 's', capacidad: 2 }, 

        { nivel: 5, tipo: 'f', capacidad: 14 },
        { nivel: 6, tipo: 'd', capacidad: 10 },
        { nivel: 7, tipo: 'p', capacidad: 6 },
    ];

    let electronRemaning = atomNum;
    let extendedConfiguration = '';

    for(let i=0; subniveles.length; i++) {
        const subnivel = subniveles[i];
        if(electronRemaning == 0) {break;}
        let electronsInThisSubnivel = Math.min(subnivel.capacidad, electronRemaning);
        extendedConfiguration += `${subnivel.nivel}${subnivel.tipo}${electronsInThisSubnivel} `;
        electronRemaning -= electronsInThisSubnivel;
    }

    extendedConfiguration = extendedConfiguration.trim()

    const nobleGases = [
        { number: 2, symbol: 'He', config: '1s2' },
        { number: 10, symbol: 'Ne', config: '1s2 2s2 2p6' },
        { number: 18, symbol: 'Ar', config: '1s2 2s2 2p6 3s2 3p6' },
        { number: 36, symbol: 'Kr', config: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6' },
        { number: 54, symbol: 'Xe', config: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6' },
        { number: 86, symbol: 'Rn', config: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6' }
    ];

    let semanticConfiguration = extendedConfiguration;

    for (let i = nobleGases.length - 1; i >= 0; i--) {
        const nobleGas = nobleGases[i];
        if (extendedConfiguration == nobleGas.config) {
            break;
        }

        if (extendedConfiguration.includes(nobleGas.config)) {
            let remainingConfig = extendedConfiguration.replace(nobleGas.config, '').trim();
            semanticConfiguration = `[${nobleGas.symbol}] ` + remainingConfig;
            break; 
        }
    }
    
    return {
        "electron_configuration": extendedConfiguration,
        "electron_configuration_semantic": semanticConfiguration,
    };
}

async function getCuanticAtomValues(lastOrbital) {
    const energyLvl = Number(lastOrbital.charAt(0)); // 1
    const orbitalName = lastOrbital.charAt(1); // s, p, d, f
    const lastOrbitalElectrons = Number(lastOrbital.slice(2)); // last electrons

    // Get m
    const maxElectronsByOrbital = {'s':2, 'p':6, 'd':10, 'f':14}[orbitalName];
    const middleOrbital = (maxElectronsByOrbital/2);
    const absPosition =
        (lastOrbitalElectrons > middleOrbital) ? 
        Math.abs(lastOrbitalElectrons - middleOrbital) : lastOrbitalElectrons;
    
    const middlePosition = Math.ceil(middleOrbital/2);
    const m = absPosition - middlePosition;
    
    return {
        N: energyLvl,
        L: orbitalName,
        m: m,
        ms: (lastOrbitalElectrons <= middleOrbital) ? "+1/2": "-1/2",
    }
}

async function viewElement(element) {
    const body = document.querySelector("body");
    body.style = "overflow: hidden";
    const electronicConfiguration = await getElectronicConfiguration(element.number);
    
    const electronConfigurationSplit = electronicConfiguration.electron_configuration.split(" ");
    const cuanticValues = await getCuanticAtomValues(electronConfigurationSplit[electronConfigurationSplit.length - 1]);
    
    async function getOrbitalsDiagram() {
        let electronicDiagram = "";
        electronConfigurationSplit.forEach((valencyEnergy) => {
            let energyLvl = Number(valencyEnergy.charAt(0)); // 1
            let orbitalName = valencyEnergy.charAt(1); // s, p, d, f
            let numOrbitalElectrons = Number(valencyEnergy.slice(2)); //

            // Función para generar las flechas de acuerdo al número de electrones y spin
            const generateElectronArrows = (maxNumElectrons, numOrbialElectrons) => {
                let arrows = ``;
                const middleIndex = (maxNumElectrons / 2);

                for (i=1; i <= maxNumElectrons; i++) {
                    let n;
                    if (i % 2 == 0) {
                        n = middleIndex + (i / 2);
                    } else {
                        n = 1 + Math.floor(i/2);
                    }
                    
                    if (n <= numOrbialElectrons) {
                        arrows += `<img class="arrow" src="/electrorbit/svg/arrow_icon.svg">`
                    }
                    else {
                        arrows += `<img style="opacity: 0%;"class="arrow" src="/electrorbit/svg/arrow_icon.svg">`
                    }
                }

                return arrows;
            };

            electronicDiagram += "<div>"
            if(orbitalName === "s") {
                electronicDiagram += `
                    <div id="${valencyEnergy}" class="orbital orbital-s">
                        ${generateElectronArrows(2, numOrbitalElectrons)}
                    </div>
                `
            } else if (orbitalName == "p") {
                electronicDiagram += `
                    <div id="${valencyEnergy}" class="orbital orbital-p">
                        ${generateElectronArrows(6, numOrbitalElectrons)}
                    </div>
                `
            } else if (orbitalName == "d") {
                electronicDiagram += `
                    <div id="${valencyEnergy}" class="orbital orbital-d">
                        ${generateElectronArrows(10, numOrbitalElectrons)}
                    </div>
                ` 
            } else if (orbitalName == "f") {
                electronicDiagram += `
                    <div id="${valencyEnergy}" class="orbital orbital-f">
                        ${generateElectronArrows(14, numOrbitalElectrons)}
                    </div>
                `
            }
            electronicDiagram += `
                <p class="valency-energy-label">${valencyEnergy}</p>
                </div> 
            `
        })
        return electronicDiagram;
    }

    viewElementInfo.innerHTML = `
        <section id="element-general-details">
            <section id="element">
                <div id="element-symbol-number">
                    <span id="view-element-number">${element.number}</span>
                    <h1 id="view-element-symbol">${element.symbol}</h1>
                </div>
                <div id="view-element-color" style="background: ${periodicColors.categoryTable[element.category]};"></div>
            </section>

            <section class="info">
                <h1 id="element-name">${element.name}</h1>
                <div id="element-info">
                    <p><span>Apariencia: </span>${element.appearance ? formatStringtoFirstUpperLetter(element.appearance) : "No definido"}</p>
                    <p><span>Información: </span><a href="${element.source}">${element.name}</a></p>
                    <p style="color: ${(element.phase == "solido") ? "#00ff00": (element.phase == "gas") ? "#ff00f7" : "#ffec00"}"><span>Estado: </span>${formatStringtoFirstUpperLetter(element.phase)}</p>
                    <p style="color: ${periodicColors.categoryTable[element.category]}">
                        <span>Categoria: </span>${formatStringtoFirstUpperLetter(element.category)}
                    </p>
                    <p><span>Descubierto por: </span>${element.discovered_by ? element.discovered_by : "Desconocido"}</p>
                    <p><span>Nombrado por: </span>${element.named_by ? element.named_by : "Desconocido"  }</p>
                    <p><span>Densidad por: </span>${element.density} Kg/m^3</p>
                    <p><span>Peso atómico: </span>${element.atomic_mass} u</p>                
                    <p><span>Punto de fusión: </span>${await getCelciusFromKelvin(element.melt)}</p>
                    <p><span>Punto de ebullisión: </span>${await getCelciusFromKelvin(element.boil)}</p>
                    <p><span>Electronegatividad: </span>${element.electronegativity_pauling ? element.electronegativity_pauling : "Desconocido"}</p>
                    <p><span>Numero: </span>${element.number}</p>
                    <p><span>Periodo: </span>${element.period}</p>
                    <p><span>Grupo: </span>${element.group}</p>
                    <p style="color: ${periodicColors.blockTable[element.block]}"><span>Bloque: </span>${element.block}</p>
                    <p><span>Afinidad electrónica: </span>${element.electron_affinity ? element.electron_affinity: "Desconocido"}</p>
                    <p><span>Energías de ionización: </span>${await getStringFromArray(element.ionization_energies)}</p>
                    <p><span>Resumen: </span>${element.summary}</p>
                </div>
            </section>
        </section>

        <section id="element-atom-details">
            <section class="info">
                <h1>Configuración Electrónica</h1>
                <div id="electronic-configuration">
                    <div id="electronic-diagram">
                        ${await getOrbitalsDiagram()}
                    </div>

                    <div id="electronic-info">
                        <p><span>Configuración: </span> ${electronicConfiguration.electron_configuration}</p>
                        <p><span>Configuración semántica: </span> ${electronicConfiguration.electron_configuration_semantic}</p>
                        <p><span>Numeros Cuanticos:</span></p> 
                        <div id="cuantic-values">
                            <p>N = <span style="color: ${periodicColors.blockTable[cuanticValues.L]}">${cuanticValues.N}</span></p>
                            <p>L = <span style="color: ${periodicColors.blockTable[cuanticValues.L]}">${cuanticValues.L}</span</p>
                            <p>m = <span style="color: orange">${cuanticValues.m}</span</p>
                            <p>ms = <span style="color: ${(cuanticValues.ms == "+1/2")? "#63ff6e" : "#ff6363"}">${cuanticValues.ms}</span</p>
                        </div>
                    </div>
                </div>

                <h1>Modelo atómico de Bohr del ${element.name}</h1>
                <model-viewer id="element-model-3d" src="${element.bohr_model_3d}" 
                            alt="Modelo 3D de ${element.name}" 
                            auto-rotate 
                            camera-controls 
                            shadow-intensity="2"

                            auto-rotate-delay="500"
                            rotation-per-second="1rad"
                            
                            max-field-of-view="25deg"
                            field-of-view="90deg"
                            xr-environment>
                </model-viewer>
            </section>
        </section>

        <button id="close-btn">
            <img src="/electrorbit/svg/home_icon.svg" alt="">
        </button>
    `
    const closeBtn = document.getElementById("close-btn");
    closeBtn.addEventListener("click", ()=> {
        viewElementInfo.classList.add("not-display")
        body.style = "";
    })

    viewElementInfo.classList.remove("not-display")

    // Model viewer events
    const model3D = document.getElementById("element-model-3d");
    model3D.addEventListener("error", (e) => {
        model3D.innerHTML = `
            <div id="error-load-model">
                <div>
                    <img src="${errorImagePreload.src}">
                    <p>¡Ups! Algo salió mal al cargar el modelo 3D.</p>
                </div>
            </div>
        `
        console.log("error:", e)
    })
}

async function main() {
    periodicTable = await getPeriodicTable()

    periodicTable.forEach((element) => {
        let elementWrapper = document.getElementById("element-"+ element.number);
        if (!elementWrapper) {return}
        
        classifiedElements.category[element.category].push(element.number);
        classifiedElements.block[element.block].push(element.number);
        
        let elementColor = periodicColors.categoryTable[element.category];
        setElement(elementWrapper, element, elementColor);

        elementWrapper.style = "cursor: pointer;"
        elementWrapper.addEventListener("click", async ()=>{
            const elementInfo = periodicTable[element.number - 1];
            await viewElement(elementInfo)
        })

        elementWrapper.addEventListener("mouseenter", (e)=> {
            toogleHightlighViewportElements(e, element)
        })

        elementWrapper.addEventListener("mouseleave", (e)=> {
            toogleHightlighViewportElements(e, element)
        })

        let viewportElementWrapper = document.getElementById("viewport-element-"+ element.number);
        if (!viewportElementWrapper) {return}
        viewportElementWrapper.style = `background: ${elementColor}`
    });

    await setElement(specialElements.spaceToAC, {"number":"57-71", "symbol": "AC"}, periodicColors.categoryTable.actínidos);
    await setElement(specialElements.spaceToLA, {"number":"89-103", "symbol": "LA"}, periodicColors.categoryTable.lantánidos);

    const viewportAC = document.getElementById("viewport-element-AC");
    const viewportLA = document.getElementById("viewport-element-LA");

    viewportAC.style = `background: ${periodicColors.categoryTable.actínidos}`
    viewportLA.style = `background: ${periodicColors.categoryTable.lantánidos}`

    electronicToggle.addEventListener("change", tooglePeriodicTableStyle)

    specialElements.spaceToAC.addEventListener("mouseenter", (e)=> {
        toogleHightlighViewportElements(e, {"block":"f", "category":"actínidos"})
    })
    specialElements.spaceToAC.addEventListener("mouseleave", (e)=> {
        toogleHightlighViewportElements(e, {"block":"f", "category":"actínidos"})
    })

    specialElements.spaceToLA.addEventListener("mouseenter", (e)=> {
        toogleHightlighViewportElements(e, {"block":"f", "category":"lantánidos"})
    })
    specialElements.spaceToLA.addEventListener("mouseleave", (e)=> {
        toogleHightlighViewportElements(e, {"block":"f", "category":"lantánidos"})
    })
}
main()