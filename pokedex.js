// console.log("Hola Explorers");
const pokeImg = document.getElementById("pokeImg");
const pokeType = document.getElementsByClassName("pokeType");
const pokeStats = document.getElementById("pokeStats");
const pokeAbilitiesNormal = document.getElementById("pokeAbilitiesNormal");
const pokeAbilitiesHidden = document.getElementById("pokeAbilitiesHidden");
const nameDisplay = document.getElementById("nameDisplay");
const pokeNumber = document.getElementById("pokeNumber");
const pokeHeight = document.getElementById("pokeHeight");
const pokeWeight = document.getElementById("pokeWeight");
// const currentClass = [];
const botones = [];
var state;
var images;
var lista;

const changeClass=(type, element)=>{
    element.className = "pokeType "+type;    
}



const changePokeTypes=(types)=>{
    pokeType[0].style.display="none";
    pokeType[1].style.display="none";
    //verificar el estado actual dado por la api de ambos botones
    for(let i=0; i<types.length;i++){
        pokeType[i].innerHTML =  types[i].type.name;
        pokeType[i].style.display="block";
        changeClass(types[i].type.name,pokeType[i]);
    }

}
const buildImage=()=>{
    const dir = state.back ? "back":"front";
    const gender = state.female && images.front_female? "_female": "";
    const shiny = state.shiny && images.front_shiny? "_shiny": "";
    
    console.log(`images.${dir}${shiny}${gender}`);
    return (eval(`images.${dir}${shiny}${gender}`));
}
const toggleShiny=()=>{
    state.shiny = !state.shiny;
    let bi = buildImage();
    if (bi){
        pokeImage(bi);
    }
}
const toggleGender=()=>{
    state.female=!state.female;
    let bi = buildImage();
    if (bi){
        pokeImage(bi);
    }
}
const toggleBack=()=>{
    state.back=!state.back;
    let bi = buildImage();
    if (bi){
        pokeImage(bi);
    }
}
const pokeImage=(url)=>{
    pokeImg.src=url;
    pokeImg.style.height="100%";  
}
const changeData=(data)=>{
    state = {
        female : false,
        shiny : false,
        back : false
    }
    //verificar si female o shiny son null entonces bloquear los controles
    images = {
        front: data.sprites.front_default,
        front_shiny: data.sprites.front_shiny,
        front_female: data.sprites.front_female,
        front_shiny_female: data.sprites.front_shiny_female,
        back: data.sprites.back_default,
        back_shiny: data.sprites.back_shiny,
        back_female: data.sprites.back_female,
        back_shiny_female: data.sprites.back_shiny_female
     }
    

    // llenar tipos
    changePokeTypes(data.types);
    
    //cambiar imagen
    pokeImage(images.front);
    
    //cambiar nombre, numero, peso y tamaño
    document.getElementById("nameNumber").style.display = "flex";
    document.getElementById("hrdiv").style.opacity = "100%";
    document.getElementById("caracteristicas").style.display = "flex";
   
    nameDisplay.innerHTML = data.name;
    pokeNumber.innerHTML = `No.${data.id}`;
    pokeHeight.innerHTML = `${data.height/10}m`;
    pokeWeight.innerHTML = `${data.weight/10}kg`


    //cambiar estadísticas
    let stats = data.stats;
    pokeStats.innerHTML="";
    for(let i=0;i<stats.length;i++){
        pokeStats.innerHTML += `<tr><td>${stats[i].stat.name}:</td> <td>${stats[i].base_stat}</td></tr>`;
    }

    let abilities = data.abilities;
    
    pokeAbilitiesNormal.innerHTML="";
    pokeAbilitiesHidden.innerHTML="";
    for(let i=0;i<abilities.length;i++){
        if(abilities[i].is_hidden != true){
            pokeAbilitiesNormal.innerHTML += `<li>${abilities[i].ability.name}</li>`;
        }
        else{
            pokeAbilitiesHidden.innerHTML += `<li>${abilities[i].ability.name}</li>`;
        }
    }
    let containers = document.getElementsByClassName("container");
    for (let i=0; i<containers.length; i++){
        containers[i].style.display="block";

    }
    
}
// image: info.sprites.front_default,
// name: chain[i].name


const fetchPokemonbyName = () =>{
    const pokeName = document.getElementById("pokeName");
    let pokeInput = pokeName.value.toLowerCase();
    const url=`https://pokeapi.co/api/v2/pokemon/${pokeInput}`;
    fetch(url).then((res)=>{
        
       //manejo de errores
       if(res.status != "200"){
        console.log(res);
        // pokeImage("https://media.comicbook.com/2017/04/pokemon-sad-moments-pikachu-crying-990351.jpg");
        }else{
            pokeType.innerHTML = "";
            pokeStats.innerHTML = "";
            return res.json();
        }
    }).then((data)=>{
        if(data){
            changeData(data);
            
            
            fetch(data.species.url).then(res=>res.json()).then(info=>{
                // 
                console.log(info);
                console.log(info.evolution_chain.url);

                return fetch(info.evolution_chain.url);
            }).then(res=>res.json()).then(data=>{
                const api = "https://pokeapi.co/api/v2/pokemon/";
                const first_evo = data.chain;
                let sec_evo;
                let third_evo;
                let promises = [];
                let total_length=0;
                if(first_evo){
                    promises.push(fetch(`${api}${first_evo.species.name}`));
                    sec_evo = first_evo.evolves_to[0];
                    console.log(sec_evo);
                    total_length+=1;
                }
                if(sec_evo){
                    promises.push(fetch(`${api}${sec_evo.species.name}`));
                    third_evo = sec_evo.evolves_to[0];
                    console.log(third_evo);
                    total_length+=1;
                }
                if(third_evo){
                    promises.push(fetch(`${api}${third_evo.species.name}`));
                    total_length+=1;
                }
                Promise.all(promises)
                .then(responses => Promise.all(responses.map(value => value.json())))
                .then(dataList => {
                    const sprites = dataList.map(v => v.sprites.front_default);
                    const names = dataList.map(n => n.name);
                    

                    lista = { evoSprites: sprites, evoNames: names };

                    const evoimg = document.getElementsByClassName('evoimg');
                    const evoNames = document.getElementsByClassName('evoName');
                    console.log(total_length);
                    for (let i=0; i<total_length;i++){
                        evoimg[i].src = lista.evoSprites[i];
                        evoimg[i].style.display="flex";
                        evoNames[i].innerHTML= lista.evoNames[i];

                    }
                    for (let i=total_length; i<3;i++){
                        evoimg[i].src ="./assets/blakpokeball.png"
                        evoNames[i].innerHTML= "No Data";

                    }
                    
                    // return lista;
                });
            })   






                
    
            
        }
        

    });
}




