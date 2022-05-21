/* global axios, Vue  */

const sources = [
	{ sourceType: "hacker-news", sourceLabel: "Hacker News", color: "#FF6600" },
	{ sourceType: "product-hunt", sourceLabel: "Product Hunt", color: "#DA552E" },
	{ sourceType: "designer-news", sourceLabel: "Designer News", color: "#2D72D9" },
	{ sourceType: "techcrunch", sourceLabel: "TechCrunch", color: "#0A9A03" },
	{ sourceType: "dev-to", sourceLabel: "Dev Community", color: "#000000", darkModeColor: "#ffffff" },
	{ sourceType: "the-next-web", sourceLabel: "The Next Web", color: "#F84221" },
	{ sourceType: "medium-technology", sourceLabel: "Medium (Technology)", color: "#2A2A2A", darkModeColor: "#ffffff" },
	{ sourceType: "smashing-magazine", sourceLabel: "Smashing Magazine", color: "#CE392B" },
	{ sourceType: "engadget", sourceLabel: "Engadget", color: "#2B2D33", darkModeColor: "#ffffff" },
	{ sourceType: "the-verge", sourceLabel: "The Verge", color: "#E1127A" },
	{ sourceType: "wired", sourceLabel: "Wired", color: "#000000", darkModeColor: "#ffffff" },
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
			const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
			let interval = seconds / 31536000;
			if (interval > 1) return Math.floor(interval) + "Y";
			interval = seconds / 2592000;
			if (interval > 1) return Math.floor(interval) + "M";
			interval = seconds / 86400;
			if (interval > 1) return Math.floor(interval) + "d";
			interval = seconds / 3600;
			if (interval > 1) return Math.floor(interval) + "h";
			interval = seconds / 60;
			if (interval > 1) return Math.floor(interval) + "m";
			return "now";
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
