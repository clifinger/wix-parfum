// into votre elixir
import { cart } from "wix-stores-frontend";

$w.onReady(function () {

    const mapping = [
        { fragrance: "#dropdown1", percentage: "#dropdown5", deleteButton: null },
        { fragrance: "#dropdown2", percentage: "#dropdown6", deleteButton: null }, 
        { fragrance: "#dropdown3", percentage: "#dropdown7", deleteButton: '#button14' },
        { fragrance: "#dropdown4", percentage: "#dropdown8", deleteButton: '#button15' }
    ]

    // initial State
    let visibleDropdowns = [
         { fragrance: "#dropdown1", percentage: "#dropdown5", deleteButton: null },
         { fragrance: "#dropdown2", percentage: "#dropdown6", deleteButton: null }, 
    ];

    hideAllDropdowns();
    showVisibleDropdowns(visibleDropdowns);

   

    $w('#button16').onClick(() => {
        visibleDropdowns = addFragrance(visibleDropdowns, mapping);
    });

    setupButton("#button8", "50ml", "Ajouter 50ml");
    setupButton("#button9", "100ml", "Ajouter 100ml");

    // Configurer les boutons de suppression en utilisant le mapping
    mapping.forEach(item => {
        setupRemoveButton(item.deleteButton, item, visibleDropdowns, mapping);
    });

    // Initialiser l'état des boutons
    updateRemoveButtons(visibleDropdowns, mapping);
});

function hideAllDropdowns() {
    for (let i = 1; i <= 4; i++) {
        $w(`#dropdown${i}`).hide();
        $w(`#dropdown${i+4}`).hide();
    }
    $w("#button14").hide();
    $w("#button15").hide();
}

function showVisibleDropdowns(visibleDropdowns) {
    visibleDropdowns.forEach((pair) => {
        $w(pair.fragrance).show();
        $w(pair.percentage).show();
    });
}

function setupButton(buttonId, size, originalText) {
    $w(buttonId).onClick(async () => {
        const button = $w(buttonId);
        const stopLoader = showLoader(button);
        
        try {
            let values = getFormattedDropdownValues();
            await addToCart(values, size);
            button.label = "Ajouté !";
            button.disable();
        } catch (error) {
            console.error('Erreur:', error);
            button.label = "Erreur";
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

function getFormattedDropdownValues() {
    let formattedValues = [];
    for (let i = 1; i <= 4; i++) {
        const fragrance = $w(`#dropdown${i}`).value;
        const concentration = $w(`#dropdown${i+4}`).value;
        if (fragrance && concentration) {
            formattedValues.push(`${fragrance} (${concentration})`);
        }
    }
    return formattedValues.join(', ');
}

async function addToCart(formattedValues, size) {
    const productId = "ff3055a8-8c74-0bc1-f8b2-58776fbdbaa8";
    const products = [
        {
            productId: productId,
            quantity: 1,
            options: {
                customTextFields: [{ title: "Personnalisation", value: formattedValues }],
                choices: { Taille: size }
            },
        }
    ];

    try {
        const updatedCart = await cart.addProducts(products);
        const cartLineItems = updatedCart.lineItems;
    } catch (error) {
        console.error('Erreur lors de l\'ajout au panier:', error);
        throw error;
    }
}

function setupRemoveButton(buttonId, item, visibleDropdowns, mapping) {
    if (buttonId) {
        $w(buttonId).onClick(() => {
            visibleDropdowns = removeFragrance(item, visibleDropdowns, mapping);
            if (visibleDropdowns.length === 4) {
                $w('#button16').disable()
            } 
             if (visibleDropdowns.length > 4) {
                $w('#button16').enable()
            } 
        });
    }
}

function removeFragrance(item, visibleDropdowns, mapping) {
    if (visibleDropdowns.length > 2) {
        // Trouver l'index de l'élément à supprimer
        const indexToRemove = visibleDropdowns.findIndex(dropdown => dropdown.deleteButton === item.deleteButton);
        
        if (indexToRemove !== -1) {
            // Supprimer l'élément
            visibleDropdowns.splice(indexToRemove, 1);

            // Réorganiser les dropdowns restants
            for (let i = indexToRemove; i < mapping.length; i++) {
                const mappingItem = mapping[i];
                const visibleItem = visibleDropdowns[i];

                if (visibleItem) {
                    // Copier les valeurs
                    $w(mappingItem.fragrance).value = $w(visibleItem.fragrance).value;
                    $w(mappingItem.percentage).value = $w(visibleItem.percentage).value;
                    
                    // Mettre à jour les références dans visibleDropdowns
                    visibleDropdowns[i] = {
                        fragrance: mappingItem.fragrance,
                        percentage: mappingItem.percentage,
                        deleteButton: mappingItem.deleteButton
                    };

                    $w(mappingItem.fragrance).show();
                    $w(mappingItem.percentage).show();
                } else {
                    // Effacer et cacher les éléments non utilisés
                    $w(mappingItem.fragrance).value = "";
                    $w(mappingItem.percentage).value = "";
                    $w(mappingItem.fragrance).hide();
                    $w(mappingItem.percentage).hide();
                }
            } 
            if (visibleDropdowns.length < 4) {
                $w('#button16').enable()
            } 
        }

        updateRemoveButtons(visibleDropdowns, mapping);
    }
    return visibleDropdowns;
}

function updateRemoveButtons(visibleDropdowns, mapping) {
    mapping.forEach((item, index) => {
        if (item.deleteButton) {
            const isVisible = index < visibleDropdowns.length;
            $w(item.deleteButton)[isVisible ? 'show' : 'hide']();
        }
    });
}

function addFragrance(visibleDropdowns, mapping) {
    if (visibleDropdowns.length < mapping.length) {
        const newItem = mapping[visibleDropdowns.length];
        
        visibleDropdowns.push({
            fragrance: newItem.fragrance,
            percentage: newItem.percentage,
            deleteButton: newItem.deleteButton
        });
        
        $w(newItem.fragrance).show();
        $w(newItem.percentage).show();
    }

    if (visibleDropdowns.length === 4) {
        $w('#button16').disable()
    } 

    updateRemoveButtons(visibleDropdowns, mapping);
    return visibleDropdowns; // Retourner le nouveau state
}