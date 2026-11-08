(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MakerAppearance=api;})(globalThis,function(){
  'use strict';
  const ageOf=age=>Math.max(10,Math.min(17,Math.floor(Number(age)||10)));
  function normalize(media,character,age,value){if(typeof value!=='string')return 'auto';const clothes=media.portraits[character]?.[ageOf(age)]||{};return value==='auto'||(Object.hasOwn(media.outfits,value)&&!!clothes[value])?value:'auto'}
  function resolve(media,{characterId,originId,age,season},selected='auto'){
    age=ageOf(age);selected=normalize(media,characterId,age,selected);const clothes=media.portraits[characterId]?.[age]||{};
    const wanted=selected==='auto'?(season==='여름'?'summer':season==='겨울'?'winter':'base'):selected,costume=clothes[wanted]?wanted:'base';
    return {age,selected,costume,label:media.outfits[costume],source:media.basePath+(clothes[costume]||''),fallbackSource:media.basePath+(clothes.base||''),roomSource:media.basePath+(media.rooms[originId]||'')};
  }
  function choices(media,character,age){return Object.entries(media.outfits).map(([id,label])=>{const firstAge=Object.keys(media.portraits[character]||{}).map(Number).sort((a,b)=>a-b).find(year=>!!media.portraits[character][year][id]);return {id,label,available:id==='auto'||!!media.portraits[character]?.[ageOf(age)]?.[id],firstAge,source:id==='auto'?null:media.portraits[character]?.[ageOf(age)]?.[id]?media.basePath+media.portraits[character][ageOf(age)][id]:null}})}
  return {normalize,resolve,choices};
});
