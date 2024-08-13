// Into page d'articles
import wixLocation from 'wix-location';

$w.onReady(function() {
    checkAndRedirect();
});

function checkAndRedirect() {
    const currentUrl = wixLocation.url;
    const productSlug = "mon-parfum-sur-mesure";
    
    if (currentUrl.includes(productSlug)) {
		wixLocation.to('https://ewabwilliam.wixsite.com/my-site-2/copie-de-accueil');
    }
}