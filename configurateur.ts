import { cart } from "wix-stores-frontend";

$w.onReady(function () {

    $w("#text107").hide();
    $w("#text108").hide();
    $w("#text109").hide();
    $w("#text110").hide();

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

    setupButton("#button8", "50ml", '59,95 CHF', visibleDropdowns);
    setupButton("#button9", "100ml", "89,95 CHF", visibleDropdowns);

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

function setupButton(buttonId, size, originalText, visibleDropdowns) {
  $w(buttonId).onClick(async () => {
    const button = $w(buttonId);
    const stopLoader = showLoader(button);

    try {
      const formattedValues = getFormattedDropdownValues(visibleDropdowns);
      const missingIndices = formattedValues.reduce((result, value, index) => {
        if (!value) {
          result.push(index + 1);
        }
        return result;
      }, []);

      if (formattedValues.filter(Boolean).length < 2) {
        $w("#text110").text = "Vous devez choisir au minimum 2 fragrances et leurs pourcentages.";
        throw new Error("Minimum 2 fragrances required");
      }

      if (missingIndices.length > 0) {
        $w("#text107").text = `Des fragrances ou des pourcentages sont manquants. Nº ${missingIndices.join(", ")}`;
        $w("#text107").show();
        throw new Error("Missing fragrance or percentage");
      }

      // Vérification des doublons
      const fragrances = formattedValues.filter(Boolean).map(value => value.split(" (")[0]);
      const duplicates = fragrances.filter((item, index) => fragrances.indexOf(item) !== index);
      if (duplicates.length > 0) {
        $w("#text110").text = `Erreur : Fragrance(s) en double détectée(s) : ${duplicates.join(", ")}`;
        $w("#text110").show();
        throw new Error("Duplicate fragrances detected");
      }

      const totalPercentage = formattedValues
        .filter(Boolean)
        .reduce((total, value) => {
          const percentage = parseInt(value.split("(")[1]);
          return isNaN(percentage) ? total : total + percentage;
        }, 0);

      if (totalPercentage !== 100) {
        $w("#text109").text = `Le total doit être égal à 100%. Votre total: ${totalPercentage}%`;
        $w("#text109").show();
        throw new Error("Total percentage must be 100%");
      }

      await addToCart(formattedValues.filter(Boolean), size);
      button.label = "Ajouté !";
      button.disable();
    } catch (error) {
      console.error('Erreur:', error);
      if (error.message === "Minimum 2 fragrances required") {
        $w("#text110").show();
      } else if (error.message === "Total percentage must be 100%") {
        $w("#text109").show();
      } else if (error.message === "Missing fragrance or percentage") {
        $w("#text107").show();
      } else if (error.message === "Duplicate fragrances detected") {
        // Ne rien faire ici car l'erreur est déjà affichée
      } else {
        $w("#text108").show();
      }
    } finally {
      stopLoader();
      setTimeout(() => {
        button.label = originalText;
        button.enable();
        $w("#text107").hide();
        $w("#text108").hide();
        $w("#text109").hide();
        $w("#text110").hide();
      }, 4000);
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

function getFormattedDropdownValues(visibleDropdowns) {
  return visibleDropdowns.map(({ fragrance, percentage }) => {
    const fragranceValue = $w(fragrance).value;
    const percentageValue = $w(percentage).value;
    return fragranceValue && percentageValue ? `${fragranceValue} (${percentageValue})` : null;
  });
}

async function addToCart(formattedValues, size) {
    console.log(formattedValues)
    const productId = "794782b0-87b4-7bc7-5337-8a9e1dc1531f";
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
        console.log(products)
        const updatedCart = await cart.addProducts(products);
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
