export default
{
  "locations": [
    "Elija su ubicación",
    "Argentina",
    "Chile",
    "Mexico",
    "Paraguay"
  ],
  "adUri": "https://api.publielectoral.lat",
  "fbAds": {
    "mainContainerQuerySelector": "[id^='topnews_main_stream_'",
    "profileIdContainerQuerySelector": "a[title='Perfil']",
    "targetAdWord": "Publicidad",
    "postQuerySelector": "hyperfeed_story_id_",
    "postIdQuerySelector": "[name=ft_ent_identifier]",
    "postSubtitleQuerySelector": /([\s\S]*.*[mM].*[eE].*[tT].*[aA]*.*[\s\S]|[fF].*[eE].*[eE].*[dD].*[sS].*[uU].*[bB].*[tT].*[iI].*[tT].*[lL].*[eE]|[sS].*[tT].*[oO].*[rR].*[yY]*.*[\s\S])/
  }
}
