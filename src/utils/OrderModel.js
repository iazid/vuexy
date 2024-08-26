class Order {
    constructor({
      id,
      ownerRef,
      eventRef,
      productMap,
      contributionRefs,
      type,
      status,
      total,
      alreadyPaid,
      created,
      paid,
      tableName = "Non spécifié", // Valeur par défaut si non fourni
      ownerName = "Inconnu", // Nom du propriétaire par défaut
    }) {
      this.id = id;
      this.ownerRef = ownerRef;  // ID du propriétaire de la commande
      this.eventRef = eventRef;  // ID de l'événement associé
      this.productMap = productMap;  // Liste des produits dans la commande
      this.contributionRefs = contributionRefs;  // Références de contribution
      this.type = type;  // Type de commande (indexé)
      this.status = status;  // Statut de la commande (indexé)
      this.total = total;  // Montant total de la commande
      this.alreadyPaid = alreadyPaid;  // Montant déjà payé
      this.created = new Date(created);  // Date de création
      this.paid = paid;  // Indicateur de paiement (booléen)
      this.tableName = tableName;  // Nom de la table associé (optionnel)
      this.ownerName = ownerName;  // Nom complet du propriétaire de la commande
    }
  
    getStatusLabel() {
      const statusMap = {
        0: 'En attente',          // PENDING
        1: 'En préparation',      // MAKING
        2: 'En livraison',        // ONTHEWAY
        3: 'Terminé',             // FINISHED
        4: 'Annulé',              // CANCELLED
        5: 'Non concerné',        // NOTCONCERNED
      };
      return statusMap[this.status] || 'Inconnu';
    }
  
    toJson() {
      return {
        ownerRef: this.ownerRef,
        eventRef: this.eventRef,
        productMap: this.productMap.map(e => e.toJson()),
        contributionRefs: this.contributionRefs?.map(e => e.id),
        type: this.type,
        status: this.status,
        total: this.total,
        alreadyPaid: this.alreadyPaid,
        created: this.created.toISOString(),
        paid: this.paid,
        tableName: this.tableName,
        ownerName: this.ownerName,
      };
    }
  }
  
  export default Order;
  