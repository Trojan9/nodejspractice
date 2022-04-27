require('dotenv').config();
const mongoose=require('mongoose')
mongoose.connect(process.env.MONGO_URI.toString(), { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;

const personSchema = new Schema({
  name: { type: String, required: true },
  age: Number,
  favoriteFoods: [String],
});

let Person= mongoose.model("Person", personSchema);

const createAndSavePerson = (done) => {
   var janeFonda = new Person({name: "Jane Fonda", age: 84, favoriteFoods: ["eggs", "fish", "fresh fruit"]});

  janeFonda.save(function(err, data) {
    if (err) return console.error(err);
    done(null, data)
  });
};

const createManyPeople = (arrayOfPeople, done) => {
 

  Person.create(arrayOfPeople,function(err, data) {
    if (err) return console.error(err);
    done(null, data)
  });
};

const findPeopleByName = (personName, done) => {
 Person.find({name: personName}, function (err, personFound) {
    if (err) return console.log(err);
    done(null, personFound);
  });
};

const findOneByFood = (food, done) => {
  Person.findOne({favoriteFoods: food}, function (err, personFound) {
    if (err) return console.log(err);
    done(null, personFound);
  });
};

const findPersonById = (personId, done) => {
   Person.findById (personId, function (err, personFound) {
    if (err) return console.log(err);
    done(null, personFound);
  });
};

const findEditThenSave = (personId, done) => {
 const foodToAdd = 'hamburger';

  // .findById() method to find a person by _id with the parameter personId as search key. 
  Person.findById(personId, (err, person) => {
    if(err) return console.log(err); 
  
    // Array.push() method to add "hamburger" to the list of the person's favoriteFoods
    person.favoriteFoods.push(foodToAdd);

    // and inside the find callback - save() the updated Person.
    person.save((err, updatedPerson) => {
      if(err) return console.log(err);
      done(null, updatedPerson)
    })
  })
};

const findAndUpdate = (personName, done) => {
   const ageToSet = 20;

  Person.findOneAndUpdate({name: personName}, {age: ageToSet}, {new: true}, (err, updatedDoc) => {
    if(err) return console.log(err);
    done(null, updatedDoc);
  })
};

const removeById = (personId, done) => {
 Person.findByIdAndRemove(
    personId,
    (err, removedDoc) => {
      if(err) return console.log(err);
      done(null, removedDoc);
    }
  ); 
};

const removeManyPeople =  function(done) {
  var nameToRemove = "Mary";
  Person.deleteMany({name: nameToRemove}, (err, data)=> {
  err ? done(err) : done(null,data)
}
)};


const queryChain = (done) => {
  // Modify the queryChain function to find people who like 
//   the food specified by the variable named 
// foodToSearch. Sort them by name, limit the results to two documents, 
// and hide their age. Chain .find(), .sort(), .limit(), .select(), 
// and then .exec(). Pass the done(err, data) callback to exec().
  const foodToSearch = "burrito";
Person.find({ favoriteFoods: foodToSearch })
  .sort({ name: 1 })
  .limit(2)
  .select({ age: 0 })
  .exec(function(error, people) {
   done(null,people)
  });
};

/** **Well Done !!**
/* You completed these challenges, let's go celebrate !
 */

//----- **DO NOT EDIT BELOW THIS LINE** ----------------------------------

exports.PersonModel = Person;
exports.createAndSavePerson = createAndSavePerson;
exports.findPeopleByName = findPeopleByName;
exports.findOneByFood = findOneByFood;
exports.findPersonById = findPersonById;
exports.findEditThenSave = findEditThenSave;
exports.findAndUpdate = findAndUpdate;
exports.createManyPeople = createManyPeople;
exports.removeById = removeById;
exports.removeManyPeople = removeManyPeople;
exports.queryChain = queryChain;
