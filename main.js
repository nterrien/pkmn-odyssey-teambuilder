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

// Fill pokemon name list
pkmnNames = document.getElementById("pokemon-names")
pokemons.forEach(pkmn => {
    var option = document.createElement('option');
    option.value = pkmn.name;
    pkmnNames.appendChild(option);
});

// Team
team = [{ species: {}, ability: 0 }, { species: {}, ability: 0 }, { species: {}, ability: 0 }, { species: {}, ability: 0 }, { species: {}, ability: 0 }, { species: {}, ability: 0 }]

// Something is entered in a pokemon name field
function choosePokemon(index) {
    input = document.getElementsByName("pokemonName" + index)[0]
    enteredValue = input.value
    resetPokemonInfo(index)
    if (enteredValue) {
        pkmnName = findPokemonFromInput(enteredValue)
        if (pkmnName.length > 0) {
            input.value = pkmnName
            pkmn = pokemons.find(p => p.name == pkmnName)
            team[index].species = pkmn
            team[index].ability = 0
            div = document.getElementById("pokemon-" + index)
            div.querySelector(".sprite").innerHTML = pokemonIcon(pkmnName)
            div.querySelector(".types").innerHTML = pkmn.types.map(t => typeIcon(t)).join(" ")
            selectAbility = document.createElement('select');
            pkmn.abilities.map((a, i) => {
                var option = document.createElement('option');
                option.value = i;
                option.innerHTML = a;
                selectAbility.appendChild(option);
            })
            div.querySelector(".ability").appendChild(selectAbility)
            selectAbility.addEventListener("change", e => abilityChanged(e, index));
            constructTable()
        }
    }
}
function keydownFunction(e, index) {
    var key = e.keyCode || e.which;
    if (key == 13) {
        choosePokemon(index)
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
    constructTable()
}
function typeIcon(t) {
    return '<span class="type-icon type-' + t.toLowerCase() + '">' + t + '</span></span>'
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
    table += "<th>Total Weak</th><th>Total Resist</th></thead><tbody>"
    for (let t of Object.keys(typeTable)) {
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