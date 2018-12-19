const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

let films = require('./top250.json');

app.get('/', (req, res) => {
	res.send('Hello World!');
});

app.get('/api/films/readall', (req, res) => {
	res.send(films.sort((a, b) => { return a.position - b.position; }));    
});

app.get('/api/films/read', (req, res) => {
	if (!req.body.id) res.send({'error': '\"id\" arg not found'});
	else {
		let r = films.find(film => film.id == req.body.id);
		if (!r) res.send({});
		else res.send(r);
	}
});

app.post('/api/films/create', (req, res) => {
	req = req.body;
	// console.log(req);
	if (!req.title || !req.rating || !req.year || !req.budget || !req.gross || !req.poster || !req.position)
		res.json({'error': 'one or more args not found'});
	if (req.year <= 1950)
		res.json({'error':'wrong year'});
	if (req.budget<0)
		res.json({'error':'wrong budget'});
	if (req.gross<0)
	    res.json({'error':'wrong gross'});
	else {
		let isErr = false;
		let obj = {};
		obj.id = Date.now();
		obj.title = req.title;
		obj.rating = parseFloat(req.rating) < 0 ? isErr = true : req.rating;
		obj.year = parseInt(req.year) < 0 ? isErr = true : req.year;
		obj.budget = parseInt(req.budget) < 0 ? isErr = true : req.budget;
		obj.gross = parseInt(req.gross) < 0 ? isErr = true : req.gross;
		obj.poster = req.poster;
		obj.position = parseInt(req.position) < 0 ? isErr = true : req.position;

		if (isErr) resp.json({'error': 'request error'});
		else {
			films = films.sort((a, b) => { return a.position - b.position; });
			let isMark = false, isAdd = false;
			let i = 0, curPos = 0, freePos = -1;
			while (i < films.length) {
				curPos = films[i].position;
				if (isMark) films[i].position++;
				else if (obj.position == films[i].position) {
					films = [ ...new Set([...films.slice(0, i), obj, ...films.slice(i)])];
					isMark = isAdd = true;
				} else if ((freePos == -1) && (i + 1 < films.length) && 
					(films[i + 1].position > films[i].position + 1) && (!isMark)) {
						obj.position = films[i].position + 1;
						films = [ ...new Set([...films.slice(0, i), obj, ...films.slice(i)])];
						isAdd = true;
						i = films.length;
					}
				i++;
			}
			if (!isAdd) {
				obj.position = curPos + 1;
				films.push(obj);
			}
			// console.log(films);
			res.json(obj);
		}
	}
});

app.post('/api/films/update', (req, res) => {
	req = req.body;
	if (!req.id) res.json({'error': '\"id\" arg not found'});
	else {
		let id = parseInt(req.id);
		let film = films[films.findIndex(i => i.id == id)];
		if (!film) res.json({'error': `item with id: ${id} not found`});
		else {
			// console.log(film);
			req.position -=1;
			if (req.title !== undefined) film.title = req.title;
			if (req.rating !== undefined) film.rating = req.rating;
			if (req.budget !== undefined) film.budget = req.budget;
			if (req.gross !== undefined) film.gross = req.gross;
			if (req.poster !== undefined) film.poster = req.poster;
			if (req.position !== undefined) film.position = req.position;
			if (req.year !== undefined) film.year = req.year;
			films = films.map((element) => {     
				if (element.position >= film.position)
					element.position++;
				return element;
			});
			films.sort((a, b) => { return a.position - b.position; });
			let pos = 1;
			films.map((element) => {//проходим по всем элементам как в фориче , но тут мы можем изм эелемент прямо во время прохлда
				if(element.position !== pos)
					element.position = pos;
				pos++;
			});

			res.json(film);
		}
	}
});

app.post('/api/films/delete', (req, res) => {
	req = req.body;
	if (!req.id) res.json({'error': '\"id\" arg not found'});
	else {
		let id = parseInt(req.id);
		let filmIndex = films.findIndex(i => i.id === id);
		// console.log(filmIndex);
		if (filmIndex < 0) res.json({'error': `item with id: ${id} not found`});
		else {
			let delpos = films[filmIndex].position;
			films.splice(filmIndex, 1);
			films.map((element) => {
				if (element.position > delpos)
					element.position--;
				return element;
			});
			res.json(films);
		}
	}
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});