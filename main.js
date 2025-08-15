function onEvent(e, t, n, o) {
    if (!e) return;
    let l = t.split(" ");
    o = o || {};
    for (let t in l) e.addEventListener(l[t], n, o)
}
function onDelegatedEvent(e, t, n, o, l) {
    if (!e) return;
    let i = n.split(" ");
    l = l || {};
    let s = function (e) {
        let n = e.target.closest(t);
        n && o(e, n)
    };
    for (let t in i) e.addEventListener(i[t], s, l)
}

// From https://stackoverflow.com/a/35279162
function levenshtein(s, t) { if (s === t) { return 0 } var n = s.length, m = t.length; if (n === 0 || m === 0) { return n + m } var x = 0, y, a, b, c, d, g, h, k; var p = [n]; for (y = 0; y < n;) { p[y] = ++y } for (; (x + 3) < m; x += 4) { var e1 = t.charCodeAt(x); var e2 = t.charCodeAt(x + 1); var e3 = t.charCodeAt(x + 2); var e4 = t.charCodeAt(x + 3); c = x; b = x + 1; d = x + 2; g = x + 3; h = x + 4; for (y = 0; y < n; y += 1) { k = s.charCodeAt(y); a = p[y]; if (a < c || b < c) { c = (a > b ? b + 1 : a + 1) } else { if (e1 !== k) { c += 1 } } if (c < b || d < b) { b = (c > d ? d + 1 : c + 1) } else { if (e2 !== k) { b += 1 } } if (b < d || g < d) { d = (b > g ? g + 1 : b + 1) } else { if (e3 !== k) { d += 1 } } if (d < g || h < g) { g = (d > h ? h + 1 : d + 1) } else { if (e4 !== k) { g += 1 } } p[y] = h = g; g = d; d = b; b = c; c = a } } for (; x < m;) { var e = t.charCodeAt(x); c = x; d = ++x; for (y = 0; y < n; y += 1) { a = p[y]; if (a < c || d < c) { d = (a > d ? d + 1 : a + 1) } else { if (e !== s.charCodeAt(y)) { d = c + 1 } else { d = c } } p[y] = d; c = a } h = d } return h }

// Fill data lists
pkmnNames = document.getElementById("pokemon-names")
pokemons.forEach(pkmn => {
    var option = document.createElement('option');
    option.value = pkmn.name;
    pkmnNames.appendChild(option);
});
typeList = Object.keys(typeTable)
typesListElement = document.getElementById("types-list")
typeList.forEach(t => {
    var option = document.createElement('option');
    option.value = t;
    typesListElement.appendChild(option);
});
abilityList = [...new Set(pokemons.flatMap(pkmn => pkmn.abilities))].sort()
abilityListElement = document.getElementById("abilities-list")
abilityList.forEach(a => {
    var option = document.createElement('option');
    option.value = a;
    abilityListElement.appendChild(option);
});
regionList = [...new Set(pokemons.flatMap(pkmn => pkmn.regional))].sort().filter(r => r)
regionListElement = document.getElementById("regions-list")
regionList.forEach(a => {
    var option = document.createElement('option');
    option.value = a
    regionListElement.appendChild(option);
});

// Team
team = [{ species: {}, ability: 0 }, { species: {}, ability: 0 }, { species: {}, ability: 0 }, { species: {}, ability: 0 }, { species: {}, ability: 0 }, { species: {}, ability: 0 }]


// Advanced search
function toggleAdvancedSearch() {
    div = document.getElementById("advanced-search")
    if (div.classList.contains("hide")) {
        div.classList.remove("hide")
    } else {
        div.classList.add("hide")
    }
}
function resetAdvancedSearch() {
    document.getElementById("type1").value = ""
    document.getElementById("type2").value = ""
    document.getElementById("ability-field").value = ""
    document.getElementById("region").value = ""
    document.getElementById("final-evo").checked = true
    startAdvancedSearch()
}

function startAdvancedSearch() {
    type1 = document.getElementById("type1").value
    if (!typeList.includes(type1)) {
        document.getElementById("type1").value = ""
    }
    type2 = document.getElementById("type2").value
    if (!typeList.includes(type2)) {
        document.getElementById("type2").value = ""
    }
    ability = document.getElementById("ability-field").value
    if (!abilityList.includes(ability)) {
        document.getElementById("ability-field").value = ""
    }
    region = document.getElementById("region").value
    if (!regionList.includes(region)) {
        document.getElementById("region").value = ""
    }
    finalEvo = document.getElementById("final-evo").checked
    filteredPokemons = pokemons.filter(pkmn =>
        (!typeList.includes(type1) || pkmn.types.includes(type1))
        && (!typeList.includes(type2) || pkmn.types.includes(type2))
        && (!abilityList.includes(ability) || pkmn.abilities.includes(ability))
        && (!regionList.includes(region) || pkmn.regional == region)
        && (!finalEvo || pkmn.final)
    )
    result = document.getElementById("search-result")
    if (filteredPokemons.length > 0) {
        result.innerHTML = filteredPokemons.map(pkmn => pkmnSearchCard(pkmn)).join(" ")
    } else {
        result.innerHTML = "<div class='text-center'>No result</div>"
    }
}

function pkmnSearchCard(pkmn) {
    res = "<span class='pkmn-result-card'>" + pokemonIcon(pkmn.name) + "<b class='name'>" + pkmn.name + "</b>"
    res += '<span class="types">' + pkmn.types.map(t => typeIcon(t)).join(" ") + "</span>"
    res += pkmn.abilities.join("/")
    res += "<button class='btn-add' onclick='addPokemonFromSearch(" + JSON.stringify(pkmn) + ")'>+</button>"
    res += "</span>"
    return res
}
function addPokemonFromSearch(pkmn) {
    console.log(team)
    lastIndex = team.findIndex(pk => pk.species.name == undefined)
    if (lastIndex == -1) { lastIndex = 5 }
    team[lastIndex].species = pkmn
    team[lastIndex].ability = 0
    fillPokemonInfo(lastIndex, pkmn)
    constructTable()
}

startAdvancedSearch()

// Something is entered in a pokemon name field
function choosePokemon(index) {
    input = document.getElementsByName("pokemonName" + index)[0]
    enteredValue = input.value
    resetPokemonInfo(index)
    if (enteredValue) {
        pkmnName = findPokemonFromInput(enteredValue)
        if (pkmnName.length > 0) {
            pkmn = pokemons.find(p => p.name == pkmnName)
            team[index].species = pkmn
            team[index].ability = 0
            fillPokemonInfo(index, pkmn)
        }
    }
    constructTable()
}
function enterDownFunction(e, call) {
    var key = e.keyCode || e.which;
    if (key == 13) {
        call()
    }
}
function findPokemonFromInput(name) {
    distances = pokemons.map(pkmn => { return { "name": pkmn.name, "distance": levenshtein(name.trim().toLowerCase(), pkmn.name.toLowerCase()) / pkmn.name.length } }).filter(d => d.distance < 0.8).sort((x, y) => x.distance - y.distance)
    if (distances.filter(d => d.name.toLowerCase().includes(enteredValue.toLowerCase())).length > 0) {
        return distances.filter(d => d.name.toLowerCase().includes(enteredValue.toLowerCase()))[0].name
    }
    if (distances.length > 0) {
        return distances[0].name
    }
    return ""
}
function resetPokemonInfo(index) {
    div = document.getElementById("pokemon-" + index)
    div.querySelector(".sprite").innerHTML = ""
    div.querySelector(".ability").innerHTML = ""
    div.querySelector(".types").innerHTML = ""
    team[index].species = {}
}
function fillPokemonInfo(index, pkmn) {
    div = document.getElementById("pokemon-" + index)
    document.getElementsByName("pokemonName" + index)[0].value = pkmn.name
    div.querySelector(".sprite").innerHTML = pokemonIcon(pkmn.name)
    div.querySelector(".types").innerHTML = pkmn.types.map(t => typeIcon(t)).join(" ")
    selectAbility = document.createElement('select');
    pkmn.abilities.map((a, i) => {
        var option = document.createElement('option');
        option.value = i;
        option.innerHTML = a;
        selectAbility.appendChild(option);
    })
    div.querySelector(".ability").innerHTML = ""
    div.querySelector(".ability").appendChild(selectAbility)
    selectAbility.addEventListener("change", e => abilityChanged(e, index));
}
function typeIcon(t) {
    return '<span class="type-icon type-' + t.toLowerCase() + '">' + t + '</span>'
}
function pokemonIcon(p) {
    return '<img width="48" height="48" alt="' + p + ' sprite" title="' + p + '" loading="lazy" src="./sprites/' + p + '.png"></img>'
}
function abilityChanged(event, index) {
    team[index].ability = event.target.selectedIndex
    constructTable()
}

function constructTable() {
    table = "<thead><tr><th>Move<br>Type</th>"
    for (let pkmn of team) {
        table += "<th>" + (pkmn.species.name ? pokemonIcon(pkmn.species.name) : '') + "</th>"
    }
    table += "<th class='tooltip'>Total Weak<span class='tooltiptext'>Number of Pokémon that takes increased damage</span></th>"
    table += "<th class='tooltip'>Total Resist<span class='tooltiptext'>Number of Pokémon that takes decreased damage</span></th></thead><tbody>"
    for (let t of typeList) {
        table += "<tr><th>" + typeIcon(t) + "</th>"
        totalWeak = 0
        totalResist = 0
        for (let pkmn of team) {
            table += "<td>"
            if (pkmn.species.name) {
                abilityMultiplier = 1
                if (abilities[pkmn.species.abilities[pkmn.ability]] && abilities[pkmn.species.abilities[pkmn.ability]][t] != undefined) {
                    abilityMultiplier = abilities[pkmn.species.abilities[pkmn.ability]][t]
                }
                damageMult = pkmn.species.types.map(def => effectiveness(t, def)).reduce((x, y) => x * y, 1) * abilityMultiplier
                if (damageMult != 1) {
                    if (damageMult > 1) {
                        totalWeak += 1
                    } else {
                        totalResist += 1
                    }
                    table += '<span class="'
                    if (damageMult >= 4) {
                        table += 'very-weak">'
                    } else if (damageMult >= 1) {
                        table += 'weak">'
                    } else if (damageMult <= 0.25) {
                        table += 'very-resist">'
                    } else {
                        table += 'resist">'
                    }
                    table += "x" + damageMult + "</span>"
                }
            }
            table += "</td>"
        }
        table += "<td class='total-resist-weak' style='background-color: rgba(255, 0, 0, " + 0.1 * (totalWeak + 1) + ")'>" + totalWeak + "</td>"
        table += "<td class='total-resist-weak' style='background-color: rgba(0, 128, 0, " + 0.1 * (totalResist + 1) + ")'>" + totalResist + "</td></tr>"
    }
    table += "</tbody>"
    document.getElementById("table").innerHTML = table
}

constructTable()

// Paste
function importPaste() {
    paste = document.getElementById("paste-field").value.trim()
    index = 0
    firstLine = true
    importedTeam = [{ species: {}, ability: 0 }, { species: {}, ability: 0 }, { species: {}, ability: 0 }, { species: {}, ability: 0 }, { species: {}, ability: 0 }, { species: {}, ability: 0 }]
    errors = []
    for (let line of paste.split("\n")) {
        if (index > 5) {
            break;
        }
        if (line.trim().length == 0) {
            index += 1
            firstLine = true
        } else if (line.startsWith("Ability: ")) {
            if (importedTeam[index].species.name) {
                ability = line.split(":")[1].trim()
                importedTeam[index].ability = importedTeam[index].species.abilities.findIndex(a => a.toLowerCase() == ability.toLowerCase())
                if (importedTeam[index].ability == -1) {
                    importedTeam[index].ability = 0
                }
            }
        } else if (firstLine) {
            firstLine = false
            // In real pokepaste the format is nickname (species) @ item
            pkmnName = line.split("@")[0].trim()
            species = pokemons.find(pkmn => pkmn.name == pkmnName)
            if (!species) {
                // Nicknames. It can't be done by default because i named Battle Bond pokemon Plusle (Battle Bond). It could be rename Plusle-Battle-Bond
                if (pkmnName.includes("(")) {
                    pkmnName = pkmnName.split("(")[1].replace(")", "").trim()
                    species = pokemons.find(pkmn => pkmn.name == pkmnName)
                }
            }
            if (!species) {
                // Error
                errors.push("Pokémon " + (index + 1) + " ( " + pkmnName + " ) not found.")
            } else {
                importedTeam[index].species = species
            }
        }
    }
    log = document.getElementById("log")
    if (paste.length > 0) {
        team = importedTeam
        for (let i = 0; i < 6; i++) {
            if (team[i].species.name) {
                fillPokemonInfo(i, team[i].species)
            }
            else {
                resetPokemonInfo(i)
            }
        }
        constructTable()
        if (errors.length > 0) {
            log.innerHTML = "Imported with errors : <br>" + errors.join("<br>")
        } else {
            log.innerHTML = "Successfully imported!"
        }
    } else {
        log.innerHTML = "Import failed! You must paste a team in the field."
    }
}
function exportPaste() {
    paste = ""
    for (let pkmn of team) {
        if (pkmn.species.name) {
            paste += pkmn.species.name + "\nAbility: " + pkmn.species.abilities[pkmn.ability] + "\n\n"
        }
    }
    log = document.getElementById("log")
    paste = paste.trim()
    if (paste.length > 0) {
        log.innerHTML = "Exported! Don't forget to save your team in a text file."
        document.getElementById("paste-field").value = paste
    } else {
        log.innerHTML = "Nothing to export! You must select at least one Pokémon."
    }
}