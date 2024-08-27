import { cart } from "wix-stores-frontend";

let errorTimer;

$w.onReady(function () {
    setupButton("#button8", "Ajouter au panier");

    // Masquer les messages d'erreur au démarrage
    hideAllErrors();
});

function setupButton(buttonId, originalText) {
    $w(buttonId).onClick(async () => {
        const button = $w(buttonId);
        const stopLoader = showLoader(button);
        
        try {
            let values = getDropdownValues();
            if (validateDropdowns(values)) {
                await addToCart(values);
                button.label = "Ajouté !";
                button.disable();
            }
        } catch (error) {
            console.error('Erreur:', error);
            button.label = "Erreur";
            showError("Une erreur inconnue est survenue, veuillez rafraichir la page et retenter ou nous contacter", "#text110");
        } finally {
            stopLoader();
            setTimeout(() => {
                button.label = originalText;
                button.enable();
            }, 2000);
        }
    });
}

function showLoader(button) {
    let dots = 0;
    button.disable();
    const intervalId = setInterval(() => {
        dots = (dots + 1) % 4;
        button.label = 'Ajout en cours' + '.'.repeat(dots);
    }, 300);

    return () => {
        clearInterval(intervalId);
        button.enable();
    };
}

function getDropdownValues() {
    return [1, 2, 3, 4, 9].map(i => $w(`#dropdown${i}`).value);
}

function validateDropdowns(values) {
    hideAllErrors();
    
    if (values.some(value => !value)) {
        const missingIndex = [1, 2, 3, 4, 5].find(i => !values[i - 1]);
        showError(`L'échantillon numéro ${missingIndex} est manquant.`, "#text108");
        return false;
    }
    
    if (values.filter(Boolean).length !== 5) {
        showError("Vous devez choisir 5 échantillons obligatoirement.", "#text107");
        return false;
    }
    
    // Vérifier les doublons
    const uniqueValues = new Set(values);
    if (uniqueValues.size !== values.length) {
        showError("Vous ne pouvez pas choisir le même échantillon plusieurs fois.", "#text110");
        return false;
    }
    
    return true;
}

function hideAllErrors() {
    $w("#text108").hide();
    $w("#text107").hide();
    $w("#text110").hide();
    
    if (errorTimer) {
        clearTimeout(errorTimer);
    }
}

function showError(message, elementId) {
    hideAllErrors();
    $w(elementId).text = message;
    $w(elementId).show();
    
    errorTimer = setTimeout(() => {
        $w(elementId).hide();
    }, 4000); // Le message d'erreur disparaîtra après 4 secondes
}

async function addToCart(values) {
    const productId = "5ac990fe-6d14-0ca0-ad0c-c0811eaf2d88";
    const formattedValues = values.join(', ');
    const products = [
        {
            productId: productId,
            quantity: 1,
            options: {
                customTextFields: [{ title: "Personnalisation", value: formattedValues }]
            },
        }
    ];

    try {
        await cart.addProducts(products);
    } catch (error) {
        console.error('Erreur lors de l\'ajout au panier:', error);
        throw error;
    }
}
