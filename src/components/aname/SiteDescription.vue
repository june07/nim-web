<template>
	<v-container fluid class="py-0 news-cycle-regular">
		<v-parallax>
			<v-card subtitle="What is in a name?" class="w-75 mx-auto" flat>
                <template v-slot:title>
                    <div class="mb-n2">
                    <span class="font-weight-bold">Aname</span>
                    <span class="font-weight-light"> - <span class="font-weight-bold">@</span> Deterministic <span class="font-weight-bold">N4m3</span> Generator</span>
                    </div>
                </template>
				<v-card-text>
					<p class="font-weight-light">
						As a developer I'm sure naming comes up plenty. I can't count the number of times I've needed to name something particularly users. Often naming is just a small part (although an essential one) of a larger project and time writing a solution over and over again for each project is time wasted.
					</p>
					<p class="my-4">I finally decided to take the prior work I've done on naming and distilled it into a project of it's own... <span class="font-weight-bold">Aname</span>. It is a robust web API for which you can use to offload the tedious but essential job of naming to.</p>
					<p class="my-4">Try it below<!--, read more about it <a href="" target="_blank" rel="noopener">here</a>.--></p>
				</v-card-text>
			</v-card>
		</v-parallax>
	</v-container>
</template>