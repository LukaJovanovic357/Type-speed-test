export default async function fetchNewParagraph() {
    try {
        const response = await fetch(
            'https://random-word-api.vercel.app/api?words=100'
        );
        const data = await response.json();
        return data.join(' ');
    } catch (err) {
        console.log(err);
        return '';
    }
}
