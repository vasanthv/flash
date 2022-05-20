/* global axios, Vue  */

const sources = [
	{ sourceType: "hacker-news", sourceLabel: "Hacker News", color: "#FF6600" },
	{ sourceType: "product-hunt", sourceLabel: "Product Hunt", color: "#DA552E" },
	{ sourceType: "designer-news", sourceLabel: "Designer News", color: "#2D72D9" },
	{ sourceType: "techcrunch", sourceLabel: "TechCrunch", color: "#0A9A03" },
	{ sourceType: "dev-to", sourceLabel: "Dev Community", color: "#000000" },
	{ sourceType: "the-next-web", sourceLabel: "The Next Web", color: "#F84221" },
	{ sourceType: "smashing-magazine", sourceLabel: "Smashing Magazine", color: "#CE392B" },
];
const selectedSources = (window.localStorage.selectedSources ?? "hacker-news,product-hunt,techcrunch").split(",");

const App = Vue.createApp({
	data() {
		return {
			online: true,
			visible: true,
			loading: true,
			showSources: false,
			showAll: false,
			selectedSources: selectedSources,
			sources: sources.map((s) => ({ ...s, isSelected: selectedSources.includes(s.sourceType) })),
			articles: [],
		};
	},
	computed: {
		showAllButton() {
			return this.articles.length > 50 && !this.showAll;
		},
	},
	methods: {
		setNetworkStatus() {
			this.online = navigator.onLine;
		},
		setVisibility() {
			this.visible = document.visibilityState === "visible";
		},
		fetchArticles() {
			this.loading = true;
			axios.get(`/api/?sources=${this.selectedSources.join(",")}`).then((response) => {
				const { items } = response.data;
				this.articles = items;
				this.loading = false;
				this.showAll = false;
			});
		},
		getTextColor(sourceType) {
			return this.sources.find((s) => s.sourceType === sourceType).color;
		},
		toggleShowSourcesPage() {
			if (this.showSources) {
				document.body.style.backgroundColor = "#ffffff";
				this.fetchArticles();
			} else {
				document.body.style.backgroundColor = "#161616";
			}
			this.showSources = !this.showSources;
		},
		toggleSelectedSources(sourceType) {
			const newSources = this.sources.map((s) => ({
				...s,
				isSelected: s.sourceType === sourceType ? !s.isSelected : s.isSelected,
			}));
			this.sources = newSources;
			const selectedSourceTypes = newSources.filter((s) => s.isSelected).map((s) => s.sourceType);
			this.selectedSources = selectedSourceTypes;
			window.localStorage.selectedSources = selectedSourceTypes.join(",");
		},
		formatDate: function(dateString) {
			const date = new Date(dateString);
			const seconds = Math.floor((new Date() - date) / 1000);

			if (seconds < 86400) {
				return (
					`${date.getHours() > 12 ? date.getHours() - 12 : date.getHours()}:` +
					(date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()) +
					` ${date.getHours() >= 12 ? "pm" : "am"}`
				);
			} else if (seconds < 604800) {
				return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()];
			} else {
				return (
					`${date.getDate() < 10 ? "0" + date.getDate() : date.getDate()} ` +
					["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()] +
					(seconds < 31536000 ? "" : `, ${date.getFullYear()}`)
				);
			}
		},
	},
}).mount("#app");

window.addEventListener("online", App.setNetworkStatus);
window.addEventListener("offline", App.setNetworkStatus);
document.addEventListener("visibilitychange", App.setVisibility);

if ("serviceWorker" in navigator) {
	navigator.serviceWorker.register("/sw.js");
}
App.fetchArticles();
